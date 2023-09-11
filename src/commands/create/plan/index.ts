import chalk from 'chalk';
import { CommandBuilder } from 'yargs';
import { CREATE_PRODUCT_NAME_QUESTION_OPTION } from '../../../constants';
import ErrorResponse from '../../../error-response';
import { CREATE_PLAN_QUESTIONS } from '../../../questions';
import {
  ICapability,
  ICommand,
  ICreatePlanQuestionAnswers,
  ICreateProductQuestionAnswers,
  IFeature,
  IPlan,
  IProduct,
  IRequestBody,
} from '../../../types';
import { dataChooser, planFeatureMenu, processAnswers, RequestBase } from '../../../utils';

const builder: CommandBuilder = {
  productName: {
    type: 'string',
    description: 'The product to create the plan on',
    default: '',
  },
  name: {
    type: 'string',
    description: 'The name of the plan',
    default: '',
  },
  displayName: {
    type: 'string',
    description: 'The display name of the plan',
    default: '',
  },
  description: {
    type: 'string',
    description: 'The description of the plan',
    default: '',
  },
  visibility: {
    type: 'string',
    description: 'The visibility of the plan',
    default: 'public',
    choices: ['public', 'private'],
  },
};

const createPlanRequestHandler = async (body: IRequestBody) => {
  return await RequestBase<IPlan>({
    method: 'POST',
    endpoint: 'plans',
    body,
  });
};

const handler = async () => {
  try {
    const PRODUCT_NAME_CHOICES = [CREATE_PRODUCT_NAME_QUESTION_OPTION];

    // 1. Prompt the user to choose the product they want to create the feature on
    const selectedProduct = await dataChooser<
      IProduct,
      ICreatePlanQuestionAnswers,
      ICreateProductQuestionAnswers
    >({
      question: CREATE_PLAN_QUESTIONS.PRODUCT_NAME(PRODUCT_NAME_CHOICES),
      startingChoices: PRODUCT_NAME_CHOICES,
      endpoint: 'products',
      targetField: 'productName',
    });

    // 2. Get all capabilities and featues for the product selected
    const productCapabilities = await RequestBase<ICapability[]>({
      method: 'GET',
      endpoint: `products/${selectedProduct?.uuid || ''}/capabilities`,
    });

    const capNames = productCapabilities?.reduce((acc: string[], cur) => {
      if (cur.status === 'ACTIVE') {
        acc.push(cur.name);
      }
      return acc;
    }, []);

    if (!capNames) {
      throw new ErrorResponse(
        400,
        'No active capabilities found, please create atleast one capability before creating a plan'
      );
    }

    // 3. Get NAME, DISPLAY_NAME, DESCRIPTION, CAPABILITIES, APP_TYPE, LICENSE_TYPE, and PUBLISHED for the new plan
    const planAnswers = await processAnswers<ICreatePlanQuestionAnswers>([
      CREATE_PLAN_QUESTIONS.NAME,
      CREATE_PLAN_QUESTIONS.DISPLAY_NAME,
      CREATE_PLAN_QUESTIONS.DESCRIPTION,
      CREATE_PLAN_QUESTIONS.CAPABILITIES(capNames),
      CREATE_PLAN_QUESTIONS.LICENSE_TYPE(selectedProduct?.appType || 'Custom'),
      CREATE_PLAN_QUESTIONS.PLAN_TYPE,
      CREATE_PLAN_QUESTIONS.PUBLISHED,
      CREATE_PLAN_QUESTIONS.VISIBILITY,
    ]);

    const {
      name: planName,
      displayName,
      description,
      capabilities,
      licenseType = 'customId',
      planType,
      published,
      visibility,
    } = planAnswers;

    const selectedCapabilites = productCapabilities?.reduce((acc: string[], cur) => {
      if (capabilities.includes(cur.name)) {
        acc.push(cur.uuid);
      }

      return acc;
    }, []);

    if (!selectedCapabilites) {
      throw new ErrorResponse(400, 'No capabilities selected, please select one to continue');
    }

    // 6x. Populate the sub questions based on the type selected
    const { planCycleInterval, planIntervalLength, evaluationPeriod, evaluationPeriodDays } =
      await processAnswers<ICreatePlanQuestionAnswers>([
        CREATE_PLAN_QUESTIONS.PLAN_CYCLE_INTERVAL(planAnswers),
        CREATE_PLAN_QUESTIONS.PLAN_INTERVAL_LENGTH(planAnswers),
        CREATE_PLAN_QUESTIONS.EVALUATION_PERIOD(planAnswers),
        CREATE_PLAN_QUESTIONS.EVALUATION_PERIOD_DAYS(planAnswers),
      ]);

    // 8. Get all the active features on the product
    const productFeatures = await RequestBase<IFeature[]>({
      method: 'GET',
      endpoint: `products/${selectedProduct?.uuid || ''}/features`,
    });

    const activeFeatures = productFeatures?.filter(({ status }) => status === 'ACTIVE');

    // 8a. If no features exist, create the new plan
    if (!activeFeatures?.length) {
      await createPlanRequestHandler({
        active: published,
        capabilities: selectedCapabilites,
        displayName,
        name: planName,
        description,
        visibility: visibility || 'private',
        features: [],
        productUuid: selectedProduct?.uuid || '',
        evaluation: evaluationPeriod || false,
        planType,
        licenseType: licenseType === 'customId' ? licenseType : licenseType.toLowerCase(),
        interval: planCycleInterval.toLowerCase(),
        pricingType: 'free',
        length: planIntervalLength || 0,
        ...(evaluationPeriod && { evalDays: evaluationPeriodDays }),
      });
    }

    // 8b. If features exist, prompt the user for a default on each one
    if (activeFeatures && activeFeatures?.length) {
      const features = [];

      // 8b1. Loop through the features asking for each's value
      for await (const feature of activeFeatures) {
        const output = await planFeatureMenu(feature);
        features.push(output);
      }

      await createPlanRequestHandler({
        active: published,
        capabilities: selectedCapabilites,
        displayName,
        name: planName,
        description,
        visibility: visibility || 'private',
        productUuid: selectedProduct?.uuid || '',
        evaluation: evaluationPeriod || false,
        planType,
        licenseType: licenseType === 'customId' ? licenseType : licenseType.toLowerCase(),
        interval: planCycleInterval.toLowerCase(),
        pricingType: 'free',
        features,
        length: planIntervalLength || 0,
        ...(evaluationPeriod && { evalDays: evaluationPeriodDays }),
      });
    }

    // 5. Log the output of the command
    // eslint-disable-next-line no-console
    console.log(
      chalk.green(`Plan: ${planName} created succesfully on ${selectedProduct?.name || ''}`)
    );
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const createPlan: ICommand = {
  command: 'plan',
  describe: 'Create a new plan for a product',
  builder,
  handler,
};
