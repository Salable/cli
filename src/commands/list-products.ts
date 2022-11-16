import RequestBase from '../utils/request-base';

const handler = async () => {
  try {
    const products = await RequestBase({
      method: 'GET',
      endpoint: 'products',
    });

    console.log(products);
  } catch (e) {
    console.error(e);
  }
};

export const listProducts = {
  command: 'list-products',
  desc: 'List all the products from your Salable account',
  handler,
};
