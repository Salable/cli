import { readFile } from 'fs/promises';
import { ICommand, IOrganisationPaymentIntegration, IRequestBody } from '../types';
import { CommandBuilder } from 'yargs';
import { resolve } from 'path';
import { z } from 'zod';
import chalk from 'chalk';
import { RequestBase } from '../utils';
import { settingsSchema } from '../schemas/settings';
import { productSchema } from '../schemas/product';

const builder: CommandBuilder = {};

const salableJsonSchema = z.object({
  settings: settingsSchema,
  products: productSchema,
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
