import chalk from 'chalk';
import RequestBase from '../utils/request-base';

const handler = async () => {
  try {
    await RequestBase({
      method: 'POST',
      endpoint: 'products',
      body: {
        name: 'example other product - 14',
        displayName: 'Example Other Product 14',
        paid: false,
      },
    });
    console.log(chalk.green('Product created succesfully'));
  } catch (e) {
    console.error(e);
  }
};

export const createProduct = {
  command: 'create-product',
  desc: 'Create a new product on your Salable account',
  handler,
};
