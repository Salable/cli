import ErrorResponse from '../../error-response';
import { ICommand, IListProductsQuestionAnswers, IProduct } from '../../types';
import { RequestBase, log, processAnswers } from '../../utils';
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

    if (!products) {
      log.warn('No products found');
      return;
    }

    if (showDeprecated === 'true') {
      log.plain<IProduct[]>(products);
      return;
    }

    const activeProducts = products.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(products) && !products.length) {
      log.warn(`No products found`);
    } else {
      log.plain<IProduct[]>(activeProducts);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const listProducts: ICommand = {
  command: 'products',
  describe: 'List all the products from your Salable account',
  builder,
  handler,
};
