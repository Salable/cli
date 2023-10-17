import { readFile } from 'fs/promises';
import { ICommand, IConfigureQuestionAnswers, IOrganisationPaymentIntegration } from '../types';
import { resolve } from 'path';
import { ZodError, z } from 'zod';
import { RequestBase, log, processAnswers } from '../utils';
import { settingsSchema } from '../schemas/settings';
import { productSchema } from '../schemas/product';
import { CONFIGURE_QUESTIONS } from '../questions';

const salableJsonSchema = z.object({
  settings: settingsSchema,
  products: productSchema,
});

function buildErrorPath(path: (string | number)[]) {
  return path.reduce((acc, cur, i) => {
    const isCurNumber = typeof cur === 'number';
    acc = `${acc}${isCurNumber ? `[${cur}]` : `${i ? '.' : ''}${cur}`}`;
    return acc;
  }, '');
}

const handler = async () => {
  let selectedPaymentIntegration = '';

  const salableJsonPath = resolve(process.cwd(), '.salable.json');

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

    const paymentIntegrationNames = paymentIntegrations?.map((int) => int.accountName);

    if (!isFreeProductsOnly && paymentIntegrations && paymentIntegrationNames) {
      const { paymentIntegration: chosenPaymentIntegrationName } =
        await processAnswers<IConfigureQuestionAnswers>(
          CONFIGURE_QUESTIONS.PAYMENT_INTEGRATION(paymentIntegrationNames)
        );

      const data = paymentIntegrations.find(
        (int) => int.accountName === chosenPaymentIntegrationName
      );

      if (!data) {
        throw new Error('Error: Unable to find that payment integration, please try again.');
      }

      selectedPaymentIntegration = data?.uuid;
    }

    await RequestBase<
      {
        token: string;
        organisationName: string;
      },
      {
        schema: typeof salableJson;
        selectedPaymentIntegration?: string;
      }
    >({
      method: 'POST',
      endpoint: `cli/configure`,
      body: {
        schema: salableJson,
        ...(paymentIntegrations && { selectedPaymentIntegration }),
      },
      command: configure.command,
    });

    log.success('It worked...').exit(0);
  } catch (e) {
    if (e instanceof ZodError) {
      log.error(`${e.errors.length} validation errors found...`);
      e.errors.forEach((e, i) => {
        log.error(
          `Validation Error ${i + 1} - Path: "${buildErrorPath(e.path)}" - Error: "${e.message}"`
        );
      });
      process.exit(1);
    }

    const error = e as Error;
    log.error(error.message || 'Something went wrong...').exit(1);
  }
};

export const configure: ICommand = {
  command: 'configure',
  describe: 'Configure your Salable account',
  handler,
};
