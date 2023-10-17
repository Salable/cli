import { CommandBuilder } from 'yargs';
import { CREATE_PRODUCT_NAME_QUESTION_OPTION } from '../../constants';
import ErrorResponse from '../../error-response';
import { CREATE_CAPABILITY_QUESTIONS } from '../../questions';
import {
  ICapability,
  ICommand,
  ICreateCapabilityQuestionAnswers,
  ICreateFeatureQuestionAnswers,
  ICreateProductQuestionAnswers,
  IProduct,
} from '../../types';
import { dataChooser, log, processAnswers, RequestBase } from '../../utils';

const builder: CommandBuilder = {
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

const handler = async () => {
  try {
    const PRODUCT_NAME_CHOICES = [CREATE_PRODUCT_NAME_QUESTION_OPTION];

    const selectedProduct = await dataChooser<
      IProduct,
      ICreateFeatureQuestionAnswers,
      ICreateProductQuestionAnswers
    >({
      question: CREATE_CAPABILITY_QUESTIONS.PRODUCT_NAME(PRODUCT_NAME_CHOICES),
      startingChoices: PRODUCT_NAME_CHOICES,
      endpoint: 'products',
      targetField: 'productName',
    });

    const { name: capabilityName } = await processAnswers<ICreateCapabilityQuestionAnswers>(
      CREATE_CAPABILITY_QUESTIONS.NAME
    );

    await RequestBase<ICapability>({
      method: 'POST',
      endpoint: 'capabilities',
      body: {
        productUuid: selectedProduct?.uuid || '',
        name: capabilityName,
      },
    });

    log.success(
      `Capability: ${capabilityName} created succesfully on ${selectedProduct?.name || ''}`
    );
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const createCapability: ICommand = {
  command: 'capability',
  describe: 'Create a new capability for a product',
  builder,
  handler,
};
