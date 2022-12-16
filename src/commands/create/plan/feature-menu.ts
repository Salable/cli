import { CREATE_PLAN_QUESTIONS } from '../../../questions';
import {
  ICreateFeatureQuestionAnswers,
  IFeature,
  IUpdateFeatureQuestionAnswers,
} from '../../../types';
import { processAnswers } from '../../../utils/process-answers';

export const featureMenu = async ({ valueType, uuid, ...feat }: IFeature) => {
  // 1. Loop through all the features and ask for values for them
  switch (valueType) {
    // 1a. If a boolean feature, ask for default
    case 'boolean':
      const { trueFalseDefault } = await processAnswers<
        Pick<IUpdateFeatureQuestionAnswers, 'trueFalseDefault'>
      >(
        CREATE_PLAN_QUESTIONS.TRUE_FALSE_DEFAULT(
          valueType,
          feat.defaultValue,
          feat.name
        )
      );

      return {
        enumValue: '',
        featureUuid: uuid,
        isUnlimited: false,
        value: trueFalseDefault.toString(),
      };

    // 1b. If a numerical feature, ask for if unlimited and value to set it as
    case 'numerical':
      const { showUnlimited, unlimitedNumberDefault, numberDefault } =
        await processAnswers<ICreateFeatureQuestionAnswers>([
          CREATE_PLAN_QUESTIONS.NUMERICAL_SHOW_UNLIMITED(
            feat.showUnlimited,
            feat.name
          ),
          CREATE_PLAN_QUESTIONS.NUMERICAL_UNLIMITED_NUMBER_DEFAULT(
            feat.defaultValue === '-1' ? 'Unlimited' : 'Number',
            feat.name
          ),
          CREATE_PLAN_QUESTIONS.NUMERICAL_NUMBER_DEFAULT(
            parseInt(feat.defaultValue),
            feat.name
          ),
        ]);

      // 1b1. If showUnlimited, check if unlimited is default (-1), if not use `numberDefault` value
      const value = showUnlimited
        ? unlimitedNumberDefault === 'Unlimited'
          ? '-1'
          : numberDefault.toString()
        : numberDefault.toString();

      return {
        enumValue: '',
        featureUuid: uuid,
        isUnlimited: showUnlimited,
        value,
      };

    // 1c. If an enum feature, ask for the selected enum from the list on the feature
    case 'enum':
      const enumNames = feat.featureEnumOptions.map(({ name }) => name);

      // 1c2. Based on the options on the feat, ask the user to select one.
      const { textOptionsDefault } = await processAnswers<
        Pick<ICreateFeatureQuestionAnswers, 'textOptionsDefault'>
      >(CREATE_PLAN_QUESTIONS.TEXT_OPTIONS_DEFAULT(enumNames, feat.name));

      return {
        enumValue:
          feat.featureEnumOptions.find(
            ({ name }) => name === textOptionsDefault
          )?.uuid || '',
        featureUuid: uuid,
        isUnlimited: false,
        value: '',
      };

    default:
      return {
        enumValue: '',
        featureUuid: uuid,
        isUnlimited: false,
        value: trueFalseDefault.toString(),
      };
  }
};
