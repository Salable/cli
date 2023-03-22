import chalk from 'chalk';
import { CommandBuilder } from 'yargs';
import ErrorResponse from '../../../error-response';
import { CREATE_FEATURES_QUESTIONS, UPDATE_FEATURE_QUESTIONS } from '../../../questions';
import {
  ICommand,
  ICreateFeatureQuestionAnswers,
  ICreateProductQuestionAnswers,
  IFeature,
  IProduct,
  IRequestBody,
  IUpdateFeatureQuestionAnswers,
} from '../../../types';
import { dataChooser, processAnswers, RequestBase } from '../../../utils';
import { updateFeatureTextMenu } from './update-feature-text-menu';

const builder: CommandBuilder = {
  productName: {
    type: 'string',
    description: 'The product to update the feature on',
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

const updateFeatureRequestHandler = async (uuid: string, body: IRequestBody) => {
  return await RequestBase<IFeature>({
    method: 'PUT',
    endpoint: `features/${uuid}`,
    body,
  });
};

const handler = async () => {
  try {
    // 1. Prompt the user to choose the product they want to update the feature on
    const selectedProduct = await dataChooser<
      IProduct,
      IUpdateFeatureQuestionAnswers,
      ICreateProductQuestionAnswers
    >({
      question: UPDATE_FEATURE_QUESTIONS.PRODUCT_NAME(['']),
      startingChoices: [],
      endpoint: 'products',
      targetField: 'productName',
    });

    // 2. Prompt the user for the feature they want to update on the selected product
    const featureToUpdate = await dataChooser<
      IFeature,
      IUpdateFeatureQuestionAnswers,
      ICreateFeatureQuestionAnswers
    >({
      question: UPDATE_FEATURE_QUESTIONS.FEATURE_NAME(selectedProduct?.features),
      startingChoices: [],
      endpoint: `products/${selectedProduct?.uuid || ''}/features`,
      targetField: 'featureName',
    });

    if (!featureToUpdate) {
      throw new ErrorResponse(400, 'No feature to update found');
    }

    // 3. Get updated NAME, DISPLAY_NAME, VARIABLE_NAME, and DESCRIPTION for the feature
    const {
      name: featureName,
      displayName,
      description,
      visibility,
    } = await processAnswers<IUpdateFeatureQuestionAnswers>([
      UPDATE_FEATURE_QUESTIONS.NAME(featureToUpdate.name),
      UPDATE_FEATURE_QUESTIONS.DISPLAY_NAME(featureToUpdate.displayName),
      UPDATE_FEATURE_QUESTIONS.DESCRIPTION(featureToUpdate.description),
      UPDATE_FEATURE_QUESTIONS.VISIBILITY(featureToUpdate.visibility),
    ]);

    const { variableName, valueType, uuid: featureUuid } = featureToUpdate;

    // 4. Depending on the valueType of the feature, ask further questions before performing request
    switch (valueType) {
      case 'boolean':
        // 4a1. Prompt the user if the default is true or false for the feature
        const { trueFalseDefault } = await processAnswers<
          Pick<IUpdateFeatureQuestionAnswers, 'trueFalseDefault'>
        >(UPDATE_FEATURE_QUESTIONS.TRUE_FALSE_DEFAULT(valueType, featureToUpdate.defaultValue));

        // 4a2. Perform the PUT request to the API to update the feature
        await updateFeatureRequestHandler(featureUuid, {
          productUuid: selectedProduct?.uuid || '',
          name: featureName,
          displayName,
          variableName,
          description,
          visibility,
          valueType,
          defaultValue: trueFalseDefault.toString(),
          showUnlimited: false,
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
          CREATE_FEATURES_QUESTIONS.NUMERICAL_SHOW_UNLIMITED(featureToUpdate.showUnlimited),
          CREATE_FEATURES_QUESTIONS.NUMERICAL_UNLIMITED_NUMBER_DEFAULT(
            featureToUpdate.defaultValue === '-1' ? 'Unlimited' : 'Number'
          ),
          CREATE_FEATURES_QUESTIONS.NUMERICAL_NUMBER_DEFAULT(
            parseInt(featureToUpdate.defaultValue)
          ),
        ]);

        // 4b2. If showUnlimited, check if unlimited is default (-1), if not use `numberDefault` value
        const defaultValue = showUnlimited
          ? unlimitedNumberDefault === 'Unlimited'
            ? '-1'
            : numberDefault.toString()
          : numberDefault.toString();

        // 4b3. Perform the PUT request to the API to update the feature
        await updateFeatureRequestHandler(featureUuid, {
          productUuid: selectedProduct?.uuid || '',
          name: featureName,
          displayName,
          variableName,
          description,
          visibility,
          valueType,
          defaultValue,
          showUnlimited,
          featureEnumOptions: [],
        });
        break;

      case 'enum':
        // 4c21 Prompt the user with a recursive menu to edit the list of text options for the feature
        const textOptions = await updateFeatureTextMenu(featureToUpdate.featureEnumOptions);

        const enumNames = textOptions.map(({ name }) => name);

        // 4c2. Based on the options chosen in 4c1, prompt the user to choose a default
        const { textOptionsDefault } = await processAnswers<
          Pick<ICreateFeatureQuestionAnswers, 'textOptionsDefault'>
        >(CREATE_FEATURES_QUESTIONS.TEXT_OPTIONS_DEFAULT(enumNames));

        // 4c3. Perform the POST request to the API to create the feature
        await updateFeatureRequestHandler(featureUuid, {
          productUuid: selectedProduct?.uuid || '',
          name: featureName,
          displayName,
          variableName,
          description,
          visibility,
          valueType,
          defaultValue: textOptionsDefault,
          showUnlimited: false,
          featureEnumOptions: textOptions.map(({ name, updatedAt, uuid }) => ({
            name,
            featureUuid,
            updatedAt,
            uuid,
          })),
        });
        break;

      default:
        break;
    }

    // 5. Log the output of the command
    // eslint-disable-next-line no-console
    console.log(
      chalk.green(`Feature: ${featureName} updated succesfully on ${selectedProduct?.name || ''}`)
    );
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const updateFeature: ICommand = {
  command: 'feature',
  describe: 'Update an existing feature on a product',
  builder,
  handler,
};
