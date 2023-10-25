import { RequestBase, log, processAnswers } from '../../utils';
import ErrorResponse from '../../error-response';
import { ICommand, ICreateProductQuestionAnswers, IProduct } from '../../types';
import { CREATE_PRODUCT_QUESTIONS } from '../../questions';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  name: {
    type: 'string',
    description: 'The name of the product for the Salable Backend',
    default: '',
  },
  displayName: {
    type: 'string',
    description: 'The name of the product to show in Pricing Tables',
    default: '',
  },
  productDescription: {
    type: 'string',
    description: 'The description of the product for tooltips in Salable',
    default: '',
  },
};

const handler = async () => {
  try {
    const {
      name,
      displayName,
      appType,
      productDescription: description,
    } = await processAnswers<ICreateProductQuestionAnswers>(CREATE_PRODUCT_QUESTIONS);

    await RequestBase<
      IProduct,
      { name: string; displayName: string; description: string; appType: string; paid: boolean }
    >({
      method: 'POST',
      endpoint: 'products',
      body: {
        name,
        displayName,
        description,
        appType,
        paid: false,
      },
    });

    log.success(`Product: ${name} created succesfully`);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const createProduct: ICommand = {
  command: 'product',
  describe: 'Create a new product on your Salable account',
  builder,
  handler,
};
