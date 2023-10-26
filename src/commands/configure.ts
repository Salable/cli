import { readFile } from 'fs/promises';
import {
  IApiKey,
  ICommand,
  IConfigureQuestionAnswers,
  IOrganisationPaymentIntegration,
  IProduct,
} from '../types';
import { resolve } from 'path';
import { ZodError, z } from 'zod';
import { RequestBase, log, processAnswers } from '../utils';
import { settingsSchema } from '../schemas/settings';
import { productSchema } from '../schemas/product';
import { CONFIGURE_QUESTIONS } from '../questions';
import { buildErrorPath } from '../utils/build-error-path';

const salableJsonSchema = z.object({
  settings: settingsSchema,
  products: productSchema,
});

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

    const createdData = await RequestBase<
      {
        apiKeys: IApiKey[];
        products: IProduct[];
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
      hideTestModeWarning: true,
    });

    if (!createdData) {
      throw new Error('Something went wrong...');
    }

    if (createdData?.apiKeys.length) {
      const apiKeys = {};
      log.success(`===== API keys created: ${createdData?.apiKeys.length} =====`);

      createdData.apiKeys.forEach((key, i) => {
        apiKeys[i + 1] = {
          name: key.name,
          value: key.value,
          scopes: key.scopes,
        };
      });

      log.plain(apiKeys, 'table');
    }

    if (createdData?.products.length) {
      const products = {};
      const plans: {
        [productUuid: string]: {
          [planIndex: number]: {
            name: string;
            uuid: string;
          };
        };
      } = {};
      log.success(`===== Products created: ${createdData?.products.length} =====`);

      createdData.products.forEach((product, i) => {
        products[i + 1] = {
          name: product.name,
          uuid: product.uuid,
          plans: product.plans.length,
        };

        product.plans.forEach((plan, planI) => {
          plans[product.uuid] = {
            ...plans[product.uuid],
            [planI + 1]: {
              name: plan.name,
              uuid: plan.uuid,
            },
          };
        });
      });

      log.plain(products, 'table');

      Object.entries(plans).forEach(([product, plans]) => {
        log.success(`===== Plans for Product: ${product} =====`);
        log.plain(plans, 'table');
      });
    }
  } catch (e) {
    const error = e as Error;

    if (error.message.includes('ZodError') || e instanceof ZodError) {
      let err: ZodError;
      if (e instanceof ZodError) {
        err = e;
      } else {
        err = JSON.parse(error.message) as unknown as ZodError;
      }

      const errors = {};

      log.error(`${err.errors.length} validation errors found...`);

      err.errors.forEach((e, i) => {
        errors[i + 1] = {
          path: buildErrorPath(e.path),
          error: e.message,
        };
      });

      log.plain(errors, 'table');
      process.exit(1);
    }

    log.error(error.message || 'Something went wrong...').exit(1);
  }
};

export const configure: ICommand = {
  command: 'configure',
  describe: 'Configure your Salable account',
  handler,
};
