import ErrorResponse from '../../error-response';
import { ICommand, IListProductsQuestionAnswers, IProduct } from '../../types';
import chalk from 'chalk';
import { RequestBase, processAnswers } from '../../utils';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated products as well as active ones',
  },
};

const handler = async () => {
  try {
    const { showDeprecated } = await processAnswers<IListProductsQuestionAnswers>();

    const products = await RequestBase<IProduct[]>({
      method: 'GET',
      endpoint: 'products',
    });

    if (showDeprecated === 'true') {
      // eslint-disable-next-line no-console
      console.log(products);
      return;
    }

    const activeProducts =
      Array.isArray(products) && products.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(products) && !products.length) {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`No products found`));
    } else {
      // eslint-disable-next-line no-console
      console.log(activeProducts);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const listProducts: ICommand = {
  command: 'products',
  describe: 'List all the products from your Salable account',
  builder,
  handler,
};
