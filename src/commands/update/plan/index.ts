import chalk from 'chalk';
import { CommandBuilder } from 'yargs';
import ErrorResponse from '../../../error-response';
import { UPDATE_PLAN_QUESTIONS } from '../../../questions';
import {
  ICommand,
  ICreatePlanQuestionAnswers,
  ICreateProductQuestionAnswers,
  IFeature,
  IPlan,
  IProduct,
  IRequestBody,
  IUpdatePlanQuestionAnswers,
} from '../../../types';
import { dataChooser } from '../../../utils/data-chooser';
import { planFeatureMenu } from '../../../utils/plan-feature-menu';
import { processAnswers } from '../../../utils/process-answers';
import { RequestBase } from '../../../utils/request-base';

const builder: CommandBuilder = {
  productName: {
    type: 'string',
    description: 'The product to update the plan on',
    default: '',
  },
  planName: {
    type: 'string',
    description: 'The name of the plan to update',
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

const updatePlanRequestHandler = async (uuid: string, body: IRequestBody) => {
  return await RequestBase<IPlan>({
    method: 'PUT',
    endpoint: `plans/${uuid}`,
    body,
  });
};

const handler = async () => {
  try {
    // 1. Prompt the user to choose the product they want to update the feature on
    const selectedProduct = await dataChooser<
      IProduct,
      IUpdatePlanQuestionAnswers,
      ICreateProductQuestionAnswers
    >({
      question: UPDATE_PLAN_QUESTIONS.PRODUCT_NAME(['']),
      startingChoices: [],
      endpoint: 'products',
      targetField: 'productName',
    });

    // 2. Prompt the user for the plan they want to update on the selected product
    const planToUpdate = await dataChooser<
      IPlan,
      IUpdatePlanQuestionAnswers,
      ICreatePlanQuestionAnswers
    >({
      question: UPDATE_PLAN_QUESTIONS.PLAN_NAME(selectedProduct?.plans),
      startingChoices: [],
      endpoint: `products/${selectedProduct?.uuid || ''}/plans`,
      targetField: 'planName',
    });

    if (!planToUpdate) {
      throw new ErrorResponse(400, 'No plan to update found');
    }

    // 3. Get NAME, DISPLAY_NAME, DESCRIPTION, APP_TYPE, LICENSE_TYPE, and PUBLISHED for the new plan
    const planAnswers = await processAnswers<ICreatePlanQuestionAnswers>([
      UPDATE_PLAN_QUESTIONS.NAME,
      UPDATE_PLAN_QUESTIONS.DISPLAY_NAME,
      UPDATE_PLAN_QUESTIONS.DESCRIPTION,
      UPDATE_PLAN_QUESTIONS.APP_TYPE,
      UPDATE_PLAN_QUESTIONS.LICENSE_TYPE,
      UPDATE_PLAN_QUESTIONS.PLAN_TYPE,
      UPDATE_PLAN_QUESTIONS.PUBLISHED,
      UPDATE_PLAN_QUESTIONS.VISIBILITY,
    ]);

    const {
      name: planName,
      displayName,
      description,
      appType,
      licenseType = 'customId',
      planType,
      published,
      visibility,
    } = planAnswers;

    // 4x. Populate the sub questions based on the type selected
    const {
      planCycleInterval,
      planIntervalLength,
      evaluationPeriod,
      evaluationPeriodDays,
    } = await processAnswers<ICreatePlanQuestionAnswers>([
      UPDATE_PLAN_QUESTIONS.PLAN_CYCLE_INTERVAL(planAnswers),
      UPDATE_PLAN_QUESTIONS.PLAN_INTERVAL_LENGTH(planAnswers),
      UPDATE_PLAN_QUESTIONS.EVALUATION_PERIOD(planAnswers),
      UPDATE_PLAN_QUESTIONS.EVALUATION_PERIOD_DAYS(planAnswers),
    ]);

    // 5. Get all the active features on the product
    const productFeatures = await RequestBase<IFeature[]>({
      method: 'GET',
      endpoint: `products/${selectedProduct?.uuid || ''}/features`,
    });

    const activeFeatures = productFeatures?.filter(
      ({ status }) => status === 'ACTIVE'
    );

    // 5a. If no active features exist, update the new plan
    if (!activeFeatures?.length) {
      await updatePlanRequestHandler(planToUpdate.uuid, {
        active: published,
        description,
        displayName,
        name: planName,
        visibility: visibility || 'private',
        type: appType.toLowerCase(),
        features: [],
        evaluation: evaluationPeriod || false,
        planType,
        licenseType:
          licenseType === 'customId' ? licenseType : licenseType.toLowerCase(),
        interval: planCycleInterval.toLowerCase(),
        pricingType: 'free',
        length: planIntervalLength || 0,
        evalDays: evaluationPeriodDays,
      });
    }

    // 5b. If features exist, prompt the user for a default on each one
    if (activeFeatures && activeFeatures?.length) {
      const features = [];

      // 5b1. Loop through the features asking for each's value
      for await (const feature of activeFeatures) {
        const output = await planFeatureMenu(feature);
        features.push(output);
      }

      await updatePlanRequestHandler(planToUpdate.uuid, {
        active: published,
        displayName,
        name: planName,
        description,
        visibility: visibility || 'private',
        type: appType.toLowerCase(),
        evaluation: evaluationPeriod || false,
        planType,
        licenseType:
          licenseType === 'customId' ? licenseType : licenseType.toLowerCase(),
        interval: planCycleInterval.toLowerCase(),
        pricingType: 'free',
        features,
        length: planIntervalLength || 0,
        evalDays: evaluationPeriodDays,
      });
    }

    // 6. Log the output of the command
    console.log(
      chalk.green(
        `Plan: ${planName} updated succesfully on ${
          selectedProduct?.name || ''
        }`
      )
    );
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const updatePlan: ICommand = {
  command: 'plan',
  describe: 'Update a plan on a product',
  builder,
  handler,
};
