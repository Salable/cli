import yargs from 'yargs';
import ErrorResponse from '../error-response';
import { IProduct } from '../types';
import RequestBase from '../utils/request-base';
import chalk from 'chalk';

const builder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated products as well as active ones',
  },
};

const handler = async () => {
  try {
    const products = await RequestBase<IProduct[]>({
      method: 'GET',
      endpoint: 'products',
    });

    const ans = Object.assign({}, yargs(process.argv).argv) as {
      [key: string]: string;
    };

    const showDeprecated = ans['showDeprecated'];

    if (showDeprecated === 'true') {
      console.log(products);
      return;
    }

    const activeProducts =
      Array.isArray(products) &&
      products?.filter(({ status }) => status !== 'DEPRECATED');

    console.log(activeProducts);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const listProducts = {
  command: 'list-products',
  desc: 'List all the products from your Salable account',
  builder,
  handler,
};
