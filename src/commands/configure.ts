import { readFile } from 'fs/promises';
import { ICommand, IOrganisationPaymentIntegration, IRequestBody } from '../types';
import { CommandBuilder } from 'yargs';
import { resolve } from 'path';
import { z } from 'zod';
import chalk from 'chalk';
import { RequestBase } from '../utils';

const builder: CommandBuilder = {};

const baseFeatureSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  variableName: z.string(),
  description: z.string().optional(),
  visibility: z.enum(['Public', 'Private']),
});

const booleanFeatureSchema = baseFeatureSchema.extend({
  type: z.literal('Boolean'),
  defaultValue: z.boolean(),
});

const numericFeatureSchema = baseFeatureSchema.extend({
  type: z.literal('Numerical'),
  showUnlimited: z.boolean(),
  value: z.number(),
  defaultValue: z.literal('Unlimited').or(z.coerce.string().refine((val) => parseInt(val))),
});

const textFeatureSchema = baseFeatureSchema.extend({
  type: z.literal('Text'),
  options: z.array(z.string()),
  defaultValue: z.string(),
});

const plansSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  capabilities: z.array(z.string()),
  planType: z.enum(['Standard', 'Bespoke', 'Evaluation', 'Coming Soon']),
  planPricing: z.enum(['Free', 'Paid']),
  price: z.number().optional(),
  planCycle: z.object({
    interval: z.enum(['Month', 'Year']),
    quantity: z.number(),
  }),
  licenseType: z.literal('Licensed'),
  evaluationPeriod: z.number(),
  visibility: z.enum(['Public', 'Private']),
  published: z.boolean(),
});

const salableJsonSchema = z.object({
  settings: z.object({
    apiKeys: z.array(
      z.object({
        name: z.string(),
        roles: z.array(z.string()).default(['Admin']),
        scopes: z.array(z.string()),
      })
    ),
  }),
  products: z.array(
    z.object({
      name: z.string(),
      displayName: z.string(),
      description: z.string().optional(),
      appType: z.enum(['Trello', 'Miro', 'Custom']),
      paid: z.boolean(),
      currency: z.enum(['GBP', 'USD', 'EUR']),
      features: z
        .discriminatedUnion('type', [booleanFeatureSchema, numericFeatureSchema, textFeatureSchema])
        .refine((val) => {
          if (val.type === 'Text') {
            return val.options.includes(val.defaultValue);
          }

          if (val.type === 'Numerical') {
            return !(!val.showUnlimited && val.defaultValue === 'Unlimited');
          }

          return true;
        })
        .array(),
      plans: z.array(plansSchema),
      capabilities: z.array(z.string()),
    })
  ),
});

const handler = async () => {
  const salableJsonPath = resolve(process.cwd(), '.salable.json');

  // TODO: handle errors nicer
  try {
    const piData = await RequestBase<IOrganisationPaymentIntegration[]>({
      method: 'GET',
      endpoint: `/payment-integrations`,
      command: configure.command,
    });

    // TODO: If multiple PIs prompt the user to select the one they want to use

    const salableJson = salableJsonSchema.parse(
      JSON.parse(
        await readFile(salableJsonPath, {
          encoding: 'utf-8',
        })
      )
    );

    if (!Array.isArray(piData)) {
      // eslint-disable-next-line no-console
      console.log(chalk.red('Something went wrong...'));
      process.exit(1);
    }

    await RequestBase<{
      token: string;
      organisationName: string;
    }>({
      method: 'POST',
      endpoint: `cli/configure`,
      body: {
        schema: salableJson,
        selectedPaymentIntegration: piData[0]?.uuid,
      } as unknown as IRequestBody,
      command: configure.command,
    });

    // eslint-disable-next-line no-console
    console.log(chalk.green('It worked...'));

    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(chalk.red('Something went wrong...'));
    process.exit(1);
  }
};

export const configure: ICommand = {
  command: 'configure',
  describe: 'Configure your Salable account',
  builder,
  handler,
};
