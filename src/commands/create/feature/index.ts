import { CommandBuilder } from 'yargs';
import { CREATE_PRODUCT_NAME_QUESTION_OPTION } from '../../../constants';
import ErrorResponse from '../../../error-response';
import { CREATE_FEATURES_QUESTIONS } from '../../../questions';
import {
  ICommand,
  ICreateFeatureQuestionAnswers,
  ICreateProductQuestionAnswers,
  IFeature,
  IPlan,
  IProduct,
  IRequestBody,
} from '../../../types';
import { dataChooser, log, processAnswers, RequestBase } from '../../../utils';
import { choosePlanFeatureValue } from './choose-plan-feature-value';
import { planTextMenu } from './plan-text-menu';

const builder: CommandBuilder = {
  productName: {
    type: 'string',
    description: 'The product to create the feature on',
    default: '',
  },
  name: {
    type: 'string',
    description: 'The name of the feature',
    default: '',
  },
  displayName: {
    type: 'string',
    description: 'The display name of the feature',
    default: '',
  },
  variableName: {
    type: 'string',
    description: 'The variable name of the feature',
    default: '',
  },
  description: {
    type: 'string',
    description: 'The description of the feature',
    default: '',
  },
  valueType: {
    type: 'string',
    description: 'The variable name of the feature',
    default: 'true/false',
    choices: ['true/false', 'numerical', 'text'],
  },
  visibility: {
    type: 'string',
    description: 'The description of the feature',
    default: 'public',
    choices: ['public', 'private'],
  },
};

const createFeatureRequestHandler = async (body: IRequestBody) => {
  return await RequestBase<IFeature, IRequestBody>({
    method: 'POST',
    endpoint: 'features',
    body,
  });
};

const handler = async () => {
  try {
    const PRODUCT_NAME_CHOICES = [CREATE_PRODUCT_NAME_QUESTION_OPTION];

    // 1. Prompt the user to choose the product they want to create the feature on
    const selectedProduct = await dataChooser<
      IProduct,
      ICreateFeatureQuestionAnswers,
      ICreateProductQuestionAnswers
    >({
      question: CREATE_FEATURES_QUESTIONS.PRODUCT_NAME(PRODUCT_NAME_CHOICES),
      startingChoices: PRODUCT_NAME_CHOICES,
      endpoint: 'products',
      targetField: 'productName',
    });

    // 2. Get all plans for the product selected
    const productPlans = await RequestBase<IPlan[]>({
      method: 'GET',
      endpoint: `products/${selectedProduct?.uuid || ''}/plans`,
    });

    const planValues: {
      [x: string]: {
        defaultValue: string;
        isUnlimited: boolean;
        value: string;
      };
    }[] = [];
    let featureOnPlans;

    // 3. Get NAME, DISPLAY_NAME, VARIABLE_NAME, and DESCRIPTION for the new feature
    const {
      name: featureName,
      displayName,
      variableName,
      description,
      valueType,
      visibility,
    } = await processAnswers<ICreateFeatureQuestionAnswers>([
      CREATE_FEATURES_QUESTIONS.NAME,
      CREATE_FEATURES_QUESTIONS.DISPLAY_NAME,
      CREATE_FEATURES_QUESTIONS.VARIABLE_NAME,
      CREATE_FEATURES_QUESTIONS.DESCRIPTION,
      CREATE_FEATURES_QUESTIONS.VALUE_TYPE,
      CREATE_FEATURES_QUESTIONS.VISIBILITY,
    ]);

    // 4. Depending on the valueType selected, ask further questions and perform POST request
    switch (valueType) {
      case 'true/false':
        // 4a1. Prompt the user if the default is true or false for the feature
        const { trueFalseDefault } = await processAnswers<
          Pick<ICreateFeatureQuestionAnswers, 'trueFalseDefault'>
        >(CREATE_FEATURES_QUESTIONS.TRUE_FALSE_DEFAULT(valueType));

        // 4a2. If there are existing plans then prompt the user to select the value for each plan for this feature
        if (productPlans) {
          for await (const plan of productPlans) {
            const output = await choosePlanFeatureValue({
              plan,
              type: 'list',
              defaults: {
                isUnlimited: false,
              },
              choices: ['true', 'false'],
            });

            planValues.push(output);
          }
        }

        featureOnPlans = planValues.reduce((acc, cur) => {
          acc = {
            ...cur,
          };
          return acc;
        }, {});

        // 4a3. Perform the POST request to the API to create the feature
        await createFeatureRequestHandler({
          productUuid: selectedProduct?.uuid || '',
          name: featureName,
          displayName,
          variableName,
          description,
          visibility,
          valueType: 'boolean',
          defaultValue: trueFalseDefault.toString(),
          showUnlimited: false,
          featureOnPlans,
          featureEnumOptions: [],
        });
        break;

      case 'numerical':
        /*
         * 4b1. Prompt the user for the configuration of the numberical type feature.
         * showUnlimited ➡️ Does the feature have the option to be unlimited
         * unlimitedNumberDefault ➡️ Is "Unlimited" or "Number" the default option for the feature
         * numberDefault ➡️ If 'showUnlimited' is false or "Number" is the default, this is the number to set.
         */
        const { showUnlimited, unlimitedNumberDefault, numberDefault } = await processAnswers<
          Pick<
            ICreateFeatureQuestionAnswers,
            'showUnlimited' | 'unlimitedNumberDefault' | 'numberDefault'
          >
        >([
          CREATE_FEATURES_QUESTIONS.NUMERICAL_SHOW_UNLIMITED(),
          CREATE_FEATURES_QUESTIONS.NUMERICAL_UNLIMITED_NUMBER_DEFAULT(),
          CREATE_FEATURES_QUESTIONS.NUMERICAL_NUMBER_DEFAULT(),
        ]);

        // 4b2. If showUnlimited, check if unlimited is default (-1), if not use `numberDefault` value
        const defaultValue = showUnlimited
          ? unlimitedNumberDefault === 'Unlimited'
            ? '-1'
            : numberDefault.toString()
          : numberDefault.toString();

        // 4b3. If there are existing plans then prompt the user to choose the defaults for each plan based on the answers above in 4b1.
        if (productPlans) {
          for await (const plan of productPlans) {
            const output = await choosePlanFeatureValue({
              plan,
              type: 'list',
              featureType: 'numerical',
              defaults: {
                isUnlimited: false,
              },
              planAnswers: {
                showUnlimited,
                unlimitedNumberDefault,
                numberDefault,
              },
            });

            planValues.push(output);
          }
        }

        featureOnPlans = planValues.reduce((acc, cur) => {
          acc = {
            ...cur,
          };
          return acc;
        }, {});

        // 4b4. Perform the POST request to the API to create the feature
        await createFeatureRequestHandler({
          productUuid: selectedProduct?.uuid || '',
          name: featureName,
          displayName,
          variableName,
          description,
          visibility,
          valueType,
          defaultValue,
          showUnlimited,
          featureOnPlans,
          featureEnumOptions: [],
        });
        break;

      case 'text':
        // 4c1. Prompt the user with a recursive menu for creating the list of text options to be used in the feature
        const textOptions = await planTextMenu();

        // 4c2. Based on the options chosen in 4c1, prompt the user to choose a default
        const { textOptionsDefault } = await processAnswers<
          Pick<ICreateFeatureQuestionAnswers, 'textOptionsDefault'>
        >(CREATE_FEATURES_QUESTIONS.TEXT_OPTIONS_DEFAULT(textOptions));

        // 4c3. If there are existing plans then prompt the user to choose the default text option for each plan
        if (productPlans) {
          for await (const plan of productPlans) {
            const output = await choosePlanFeatureValue({
              plan,
              type: 'list',
              choices: textOptions,
              defaults: {
                isUnlimited: false,
              },
            });

            planValues.push(output);
          }
        }

        featureOnPlans = planValues.reduce((acc, cur) => {
          acc = {
            ...cur,
          };
          return acc;
        }, {});

        // 4c4. Perform the POST request to the API to create the feature
        await createFeatureRequestHandler({
          productUuid: selectedProduct?.uuid || '',
          name: featureName,
          displayName,
          variableName,
          description,
          visibility,
          valueType: 'enum',
          defaultValue: textOptionsDefault,
          showUnlimited: false,
          featureOnPlans,
          featureEnumOptions: textOptions.map((option) => ({ name: option })),
        });
        break;

      default:
        break;
    }

    // 5. Log the output of the command
    log.success(`Feature: ${featureName} created succesfully on ${selectedProduct?.name || ''}`);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const createFeature: ICommand = {
  command: 'feature',
  describe: 'Create a new feature for a product',
  builder,
  handler,
};
