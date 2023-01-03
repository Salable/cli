import { Answers } from 'inquirer';
import { CREATE_FEATURES_QUESTIONS } from '../../../questions';
import { ICreateFeatureQuestionAnswers, IPlan } from '../../../types';
import { processAnswers } from '../../../utils/process-answers';

export const choosePlanFeatureValue = async ({
  plan,
  type,
  featureType,
  defaults,
  choices,
  planAnswers = {},
}: {
  plan: IPlan;
  type: string;
  featureType?: 'true/false' | 'numerical' | 'text';
  defaults?: {
    defaultValue?: string;
    isUnlimited?: boolean;
    value?: string;
  };
  choices?: string[];
  planAnswers?: Answers;
}) => {
  // 1. For the plan, prompt the user to select the values for the feature being created
  // 1a. If the feature being created is a numerical one and 'Unlimited' is an option
  if (featureType === 'numerical' && planAnswers?.showUnlimited) {
    // 1a1. Ask if the plan should default to 'Unlimited', if not ask for a number to use as the default.
    const { planUnlimitedNumberDefault, planNumberDefault } =
      await processAnswers<
        Pick<
          ICreateFeatureQuestionAnswers,
          'planUnlimitedNumberDefault' | 'planNumberDefault'
        >
      >([
        CREATE_FEATURES_QUESTIONS.PLAN_NUMERICAL_UNLIMITED_NUMBER_DEFAULT(
          planAnswers,
          plan.name
        ),
        CREATE_FEATURES_QUESTIONS.PLAN_NUMERICAL_NUMBER_DEFAULT(
          planAnswers,
          plan.name
        ),
      ]);

    // 1a2. Determine the value to use in the request based on the answers above
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

  // 1b. If the feature being created is a numerical one and 'Unlimited' is NOT an option
  if (featureType === 'numerical' && !planAnswers?.showUnlimited) {
    // 1b1. Prompt the user for the number to use as a default for the feature
    const { planNumberDefault } = await processAnswers<
      Pick<ICreateFeatureQuestionAnswers, 'planNumberDefault'>
    >([
      CREATE_FEATURES_QUESTIONS.PLAN_NUMERICAL_NUMBER_DEFAULT(
        planAnswers,
        plan.name
      ),
    ]);

    return {
      [plan.uuid]: {
        defaultValue: defaults?.defaultValue || '',
        isUnlimited: false,
        value: defaults?.value || planNumberDefault.toString(),
      },
    };
  }

  // 1c. If the feature being created is not a numerical one.
  const { planFeatureValue } =
    await processAnswers<ICreateFeatureQuestionAnswers>(
      CREATE_FEATURES_QUESTIONS.PLAN_FEATURE_VALUE({
        planName: plan.name,
        type,
        choices,
      })
    );

  return {
    [plan.uuid]: {
      defaultValue: defaults?.defaultValue || '',
      isUnlimited: defaults?.isUnlimited || false,
      value: defaults?.value || planFeatureValue,
    },
  };
};
