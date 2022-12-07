import ErrorResponse from '../../error-response';
import { ICommand, IListProductsQuestionAnswers, IProduct } from '../../types';
import chalk from 'chalk';
import { RequestBase } from '../../utils/request-base';
import { processAnswers } from '../../utils/process-answers';

const builder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated products as well as active ones',
  },
};

const handler = async () => {
  try {
    const { showDeprecated } = processAnswers<IListProductsQuestionAnswers>();

    const products = await RequestBase<IProduct[]>({
      method: 'GET',
      endpoint: 'products',
    });

    if (showDeprecated === 'true') {
      console.log(products);
      return;
    }

    const activeProducts =
      Array.isArray(products) &&
      products.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(products) && !products.length) {
      console.log(chalk.yellow(`No products found`));
    } else {
      console.log(activeProducts);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const listProducts: ICommand = {
  command: 'products',
  describe: 'List all the products from your Salable account',
  builder,
  handler,
};
