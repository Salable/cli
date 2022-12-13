import chalk from 'chalk';
import inquirer, { Answers } from 'inquirer';
import { isProd } from '../../config';
import {
  ARGUMENT_SEPARATOR,
  COMMAND_BASE,
  CREATE_PRODUCT_NAME_QUESTION_OPTION,
} from '../../constants';
import ErrorResponse from '../../error-response';
import {
  CREATE_FEATURES_QUESTIONS,
  CREATE_PRODUCT_QUESTIONS,
} from '../../questions';
import {
  ICommand,
  ICreateCapabilityQuestionAnswers,
  ICreateFeatureQuestionAnswers,
  ICreateProductQuestionAnswers,
  IFeature,
  IPlan,
  IProduct,
  IRequestBody,
} from '../../types';
import { execPromise } from '../../utils/exec-promise';
import { fetchData } from '../../utils/fetch-data';
import { processAnswers } from '../../utils/process-answers';
import { RequestBase } from '../../utils/request-base';

const PRODUCT_NAME_CHOICES = [CREATE_PRODUCT_NAME_QUESTION_OPTION];
const PRODUCT_NAME_QUESTION =
  CREATE_FEATURES_QUESTIONS.PRODUCT_NAME(PRODUCT_NAME_CHOICES);

const builder = {
  productName: {
    type: 'string',
    description: 'The product to create the capability on',
    default: '',
  },
  name: {
    type: 'string',
    description: 'The name of the capability',
    default: '',
  },
};

const choosePlanFeatureValue = async ({
  plans,
  type,
  planType,
  defaults,
  choices,
  planAnswers = {},
}: {
  plans: IPlan[];
  type: string;
  planType?: 'true/false' | 'numerical' | 'text';
  defaults?: {
    defaultValue?: string;
    isUnlimited?: boolean;
    value?: string;
  };
  choices?: string[];
  planAnswers?: Answers;
}) => {
  const output = await Promise.all(
    plans.map(async (plan) => {
      if (planType === 'numerical' && planAnswers?.showUnlimited) {
        const numericalAnswers: Answers = await inquirer.prompt([
          CREATE_FEATURES_QUESTIONS.PLAN_NUMERICAL_UNLIMITED_NUMBER_DEFAULT(
            planAnswers,
            plan.name
          ),
          CREATE_FEATURES_QUESTIONS.PLAN_NUMERICAL_NUMBER_DEFAULT(
            planAnswers,
            plan.name
          ),
        ]);

        const { planUnlimitedNumberDefault, planNumberDefault } =
          processAnswers<
            Pick<
              ICreateFeatureQuestionAnswers,
              'planUnlimitedNumberDefault' | 'planNumberDefault'
            >
          >(numericalAnswers);

        const value =
          planUnlimitedNumberDefault === 'Unlimited'
            ? '-1'
            : planNumberDefault.toString();

        return {
          [plan.uuid]: {
            defaultValue: defaults?.defaultValue || '',
            isUnlimited: planUnlimitedNumberDefault === 'Unlimited',
            value: defaults?.value || value,
          },
        };
      }

      if (planType === 'numerical' && !planAnswers?.showUnlimited) {
        const numericalAnswers: Answers = await inquirer.prompt([
          CREATE_FEATURES_QUESTIONS.PLAN_NUMERICAL_NUMBER_DEFAULT(
            planAnswers,
            plan.name
          ),
        ]);

        const { planNumberDefault } =
          processAnswers<
            Pick<ICreateFeatureQuestionAnswers, 'planNumberDefault'>
          >(numericalAnswers);

        return {
          [plan.uuid]: {
            defaultValue: defaults?.defaultValue || '',
            isUnlimited: false,
            value: defaults?.value || planNumberDefault.toString(),
          },
        };
      }

      const planFeatureValueAnswers: Answers = await inquirer.prompt(
        CREATE_FEATURES_QUESTIONS.PLAN_FEATURE_VALUE({
          planName: plan.name,
          type,
          choices,
        })
      );

      const { planFeatureValue } =
        processAnswers<ICreateFeatureQuestionAnswers>(planFeatureValueAnswers);

      return {
        [plan.uuid]: {
          defaultValue: defaults?.defaultValue || '',
          isUnlimited: defaults?.isUnlimited || false,
          value: defaults?.value || planFeatureValue,
        },
      };
    })
  );

  return output.reduce((acc, cur) => {
    acc = {
      ...cur,
    };

    return acc;
  }, {});
};

const textOptionMenu = async () => {
  const createTextMenuAnswers: Answers = await inquirer.prompt(
    CREATE_FEATURES_QUESTIONS.TEXT_CREATE_OPTION_MENU
  );

  const { createTextMenuOption } = processAnswers<
    Pick<ICreateFeatureQuestionAnswers, 'createTextMenuOption'>
  >(createTextMenuAnswers);

  return createTextMenuOption;
};

const handler = async () => {
  try {
    let loopCreate = true;
    let productName = '';
    let products: IProduct[] = [];

    const createFeatureRequestHandler = async (body: IRequestBody) => {
      return await RequestBase<IFeature>({
        method: 'POST',
        endpoint: 'features',
        body,
      });
    };

    // 1. Choose PRODUCT to create feature on
    while (loopCreate) {
      const { data, choices } = await fetchData<IProduct>({
        choices: PRODUCT_NAME_CHOICES,
        endpoint: 'products',
      });

      products = data;
      PRODUCT_NAME_QUESTION.choices = choices;

      const productNameAnswers: Answers = await inquirer.prompt(
        PRODUCT_NAME_QUESTION
      );

      productName =
        processAnswers<ICreateCapabilityQuestionAnswers>(productNameAnswers)[
          'productName'
        ];

      if (productName === CREATE_PRODUCT_NAME_QUESTION_OPTION) {
        const createProductAnswers: Answers = await inquirer.prompt(
          CREATE_PRODUCT_QUESTIONS
        );

        const { name, displayName, productDescription } =
          processAnswers<ICreateProductQuestionAnswers>(createProductAnswers);

        const CREATE_PRODUCT_COMMAND = `${COMMAND_BASE} create product ${ARGUMENT_SEPARATOR} --name="${name}" --displayName="${displayName}" --productDescription="${productDescription}"`;

        const { stdout, stderr } = await execPromise(CREATE_PRODUCT_COMMAND);

        console.log(chalk.green(stdout));

        if (stderr && isProd) {
          console.log(chalk.red(stderr));
          process.exit(1);
        }
      } else {
        loopCreate = false;
      }
    }

    const selectedProduct = products?.find(({ name }) => name === productName);

    // 2. Get all plans for the selected product
    const productPlans = await RequestBase<IPlan[]>({
      method: 'GET',
      endpoint: `products/${selectedProduct?.uuid || ''}/plans`,
    });
    let planValues;

    // 2. Get NAME, DISPLAY_NAME, VARIABLE_NAME, and DESCRIPTION for feature
    const featureDetailAnswers: Answers = await inquirer.prompt([
      CREATE_FEATURES_QUESTIONS.NAME,
      CREATE_FEATURES_QUESTIONS.DISPLAY_NAME,
      CREATE_FEATURES_QUESTIONS.VARIABLE_NAME,
      CREATE_FEATURES_QUESTIONS.DESCRIPTION,
      CREATE_FEATURES_QUESTIONS.VALUE_TYPE,
      CREATE_FEATURES_QUESTIONS.VISIBILITY,
    ]);

    const {
      name: featureName,
      displayName,
      variableName,
      description,
      valueType,
      visibility,
    } = processAnswers<ICreateFeatureQuestionAnswers>(featureDetailAnswers);

    // 4. Depending on the valueType selected, ask further questions and perform POST request
    switch (valueType) {
      case 'true/false':
        const trueFalseDefaultAnswer: Answers = await inquirer.prompt(
          CREATE_FEATURES_QUESTIONS.TRUE_FALSE_DEFAULT(featureDetailAnswers)
        );

        const { trueFalseDefault } = processAnswers<
          Pick<ICreateFeatureQuestionAnswers, 'trueFalseDefault'>
        >(trueFalseDefaultAnswer);

        if (productPlans?.length) {
          planValues = await choosePlanFeatureValue({
            plans: productPlans,
            type: 'list',
            choices: ['true', 'false'],
            defaults: {
              isUnlimited: false,
            },
          });
        }

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
          featureOnPlans: planValues || {},
          featureEnumOptions: [],
        });
        break;

      case 'numerical':
        const numericalAnswers: Answers = await inquirer.prompt([
          CREATE_FEATURES_QUESTIONS.NUMERICAL_SHOW_UNLIMITED,
          CREATE_FEATURES_QUESTIONS.NUMERICAL_UNLIMITED_NUMBER_DEFAULT,
          CREATE_FEATURES_QUESTIONS.NUMERICAL_NUMBER_DEFAULT,
        ]);

        const { showUnlimited, unlimitedNumberDefault, numberDefault } =
          processAnswers<
            Pick<
              ICreateFeatureQuestionAnswers,
              'showUnlimited' | 'unlimitedNumberDefault' | 'numberDefault'
            >
          >(numericalAnswers);

        // If showUnlimited, check if unlimited is default (-1), if not use numberDefault provided
        const defaultValue = showUnlimited
          ? unlimitedNumberDefault === 'Unlimited'
            ? '-1'
            : numberDefault.toString()
          : numberDefault.toString();

        if (productPlans?.length) {
          planValues = await choosePlanFeatureValue({
            plans: productPlans,
            type: 'list',
            planType: 'numerical',
            defaults: {
              isUnlimited: false,
            },
            planAnswers: {
              showUnlimited,
              unlimitedNumberDefault,
              numberDefault,
            },
          });
        }

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
          featureOnPlans: planValues || {},
          featureEnumOptions: [],
        });
        break;

      case 'text':
        let loopTextCreate = true;
        let showMenu = false;
        let textOptions: string[] = [];

        // Loop through menu to create and delete text options from Feature
        while (loopTextCreate) {
          const createTextAnswers: Answers = await inquirer.prompt(
            CREATE_FEATURES_QUESTIONS.TEXT_CREATE_OPTION
          );

          const { createTextOption } =
            processAnswers<
              Pick<ICreateFeatureQuestionAnswers, 'createTextOption'>
            >(createTextAnswers);

          textOptions.push(createTextOption);

          showMenu = true;

          while (showMenu) {
            // If there are no options created, skip the menu back to 'create an option' question
            if (!textOptions?.length) {
              showMenu = false;
              break;
            }

            const option = await textOptionMenu();

            if (option === 'Continue') {
              loopTextCreate = false;
              showMenu = false;
            }

            if (option === 'Create a new text option') {
              showMenu = false;
            }

            // If 'delete' is selected, remove the item and then reprompt the user for what they want to do.
            if (option === 'Delete a text option') {
              const deleteTextOptionAnswers: Answers = await inquirer.prompt(
                CREATE_FEATURES_QUESTIONS.TEXT_DELETE_OPTION(textOptions)
              );

              const { deleteTextOption } = processAnswers<
                Pick<ICreateFeatureQuestionAnswers, 'deleteTextOption'>
              >(deleteTextOptionAnswers);

              textOptions = textOptions.filter(
                (option) => option !== deleteTextOption
              );
            }
          }
        }

        // Prompt from the default text option
        const textOptionsDefaultAnswer: Answers = await inquirer.prompt(
          CREATE_FEATURES_QUESTIONS.TEXT_OPTIONS_DEFAULT(textOptions)
        );

        const { textOptionsDefault } = processAnswers<
          Pick<ICreateFeatureQuestionAnswers, 'textOptionsDefault'>
        >(textOptionsDefaultAnswer);

        if (productPlans?.length) {
          planValues = await choosePlanFeatureValue({
            plans: productPlans,
            type: 'list',
            choices: textOptions,
            defaults: {
              isUnlimited: false,
            },
          });
        }

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
          featureOnPlans: planValues || {},
          featureEnumOptions: textOptions.map((option) => ({ name: option })),
        });
        break;

      default:
        break;
    }

    console.log(
      chalk.green(
        `Feature: ${featureName} created succesfully on ${productName}`
      )
    );
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const createFeature: ICommand = {
  command: 'feature',
  describe: 'Create a new feature for a product',
  builder,
  handler,
};
