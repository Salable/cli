import yargs from 'yargs';
import { IProduct } from '../types';
import RequestBase from '../utils/request-base';

const builder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated products as well as active ones',
  },
};

const handler = async () => {
  try {
    const products: IProduct[] | undefined = await RequestBase({
      method: 'GET',
      endpoint: 'products',
    });

    const ans = Object.assign({}, yargs.argv) as {
      [key: string]: string;
    };

    const showDeprecated = ans['showDeprecated'];

    if (showDeprecated === 'true') {
      console.log(products);
      return;
    }

    const activeProducts = products?.filter(
      ({ status }) => status !== 'DEPRECATED'
    );

    console.log(activeProducts);
  } catch (e) {
    console.error(e);
  }
};

export const listProducts = {
  command: 'list-products',
  desc: 'List all the products from your Salable account',
  builder,
  handler,
};
