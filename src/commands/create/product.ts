import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import inquirer, { Answers } from 'inquirer';
import ErrorResponse from '../../error-response';
import { ICommand, ICreateProductQuestionAnswers, IProduct } from '../../types';
import { CREATE_PRODUCT_QUESTIONS } from '../../questions';
import { processAnswers } from '../../utils/process-answers';

const builder = {
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
    const answers: Answers = await inquirer.prompt(CREATE_PRODUCT_QUESTIONS);

    const {
      name,
      displayName,
      productDescription: description,
    } = processAnswers<ICreateProductQuestionAnswers>(answers);

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

    console.log(chalk.green(`Product: ${name} created succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const createProduct: ICommand = {
  command: 'product',
  describe: 'Create a new product on your Salable account',
  builder,
  handler,
};
