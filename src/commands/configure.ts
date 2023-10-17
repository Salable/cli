import { readFile } from 'fs/promises';
import {
  ICommand,
  IConfigureQuestionAnswers,
  IOrganisationPaymentIntegration,
  IRequestBody,
} from '../types';
import { resolve } from 'path';
import { z } from 'zod';
import chalk from 'chalk';
import { RequestBase, processAnswers } from '../utils';
import { settingsSchema } from '../schemas/settings';
import { productSchema } from '../schemas/product';
import { CONFIGURE_QUESTIONS } from '../questions';

const salableJsonSchema = z.object({
  settings: settingsSchema,
  products: productSchema,
});

const handler = async () => {
  let selectedPaymentIntegration = '';

  const salableJsonPath = resolve(process.cwd(), '.salable.json');

  // TODO: handle errors nicer
  try {
    const paymentIntegrations = await RequestBase<IOrganisationPaymentIntegration[]>({
      method: 'GET',
      endpoint: `/payment-integrations`,
      command: configure.command,
    });

    const salableJson = salableJsonSchema.parse(
      JSON.parse(
        await readFile(salableJsonPath, {
          encoding: 'utf-8',
        })
      )
    );

    const isFreeProductsOnly = salableJson.products.every((prod) => !prod.paid);

    if (!isFreeProductsOnly && !paymentIntegrations?.length) {
      // eslint-disable-next-line no-console
      console.log(
        chalk.red(
          'Error: Unable to create a paid product without a payment integration configured. Please configure one in the dashboard to continue.'
        )
      );

      // eslint-disable-next-line no-console
      console.log(
        chalk.red(
          'Read More: https://docs.salable.app/docs/payment-integration/add-stripe-to-salable'
        )
      );
      process.exit(1);
    }

    const paymentIntegrationNames = paymentIntegrations?.map((int) => int.integrationName);

    if (paymentIntegrations && paymentIntegrationNames) {
      // 1. Get the user to choose a payment integration
      const { paymentIntegration: chosenPaymentIntegrationName } =
        await processAnswers<IConfigureQuestionAnswers>(
          CONFIGURE_QUESTIONS.PAYMENT_INTEGRATION(paymentIntegrationNames)
        );

      const data = paymentIntegrations.find(
        (int) => int.integrationName === chosenPaymentIntegrationName
      );

      if (!data) {
        // eslint-disable-next-line no-console
        console.log(chalk.red('Error: Unable to find that payment integration, please try again.'));
        process.exit(1);
      }

      selectedPaymentIntegration = data?.uuid;
    }

    await RequestBase<{
      token: string;
      organisationName: string;
    }>({
      method: 'POST',
      endpoint: `cli/configure`,
      body: {
        schema: salableJson,
        ...(paymentIntegrations && { selectedPaymentIntegration }),
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
  handler,
};
