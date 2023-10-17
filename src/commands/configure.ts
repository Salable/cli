import { readFile } from 'fs/promises';
import {
  ICommand,
  IConfigureQuestionAnswers,
  IOrganisationPaymentIntegration,
  IRequestBody,
} from '../types';
import { resolve } from 'path';
import { z } from 'zod';
import { RequestBase, log, processAnswers } from '../utils';
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
      throw new Error(`Error: Unable to create a paid product without a payment integration configured. Please configure one in the dashboard to continue.
        Read More: https://docs.salable.app/docs/payment-integration/add-stripe-to-salable`);
    }

    const paymentIntegrationNames = paymentIntegrations?.map((int) => int.integrationName);

    if (!isFreeProductsOnly && paymentIntegrations && paymentIntegrationNames) {
      const { paymentIntegration: chosenPaymentIntegrationName } =
        await processAnswers<IConfigureQuestionAnswers>(
          CONFIGURE_QUESTIONS.PAYMENT_INTEGRATION(paymentIntegrationNames)
        );

      const data = paymentIntegrations.find(
        (int) => int.integrationName === chosenPaymentIntegrationName
      );

      if (!data) {
        throw new Error('Error: Unable to find that payment integration, please try again.');
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

    log.success('It worked...').exit(0);
  } catch (e) {
    const error = e as Error;
    log.error(error.message || 'Something went wrong...').exit(1);
  }
};

export const configure: ICommand = {
  command: 'configure',
  describe: 'Configure your Salable account',
  handler,
};
