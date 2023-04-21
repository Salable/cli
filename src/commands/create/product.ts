import { RequestBase, processAnswers } from '../../utils';
import chalk from 'chalk';
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
      productDescription: description,
    } = await processAnswers<ICreateProductQuestionAnswers>(CREATE_PRODUCT_QUESTIONS);

    await RequestBase<IProduct>({
      method: 'POST',
      endpoint: 'products',
      body: {
        name,
        displayName,
        description,
        paid: false,
      },
    });

    // eslint-disable-next-line no-console
    console.log(chalk.green(`Product: ${name} created succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const createProduct: ICommand = {
  command: 'product',
  describe: 'Create a new product on your Salable account',
  builder,
  handler,
};
