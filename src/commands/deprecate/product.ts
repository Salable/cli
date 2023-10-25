import { RequestBase, log, processAnswers } from '../../utils';
import ErrorResponse from '../../error-response';
import { ICommand, IDeprecateProductQuestionAnswers, IProduct } from '../../types';
import { DEPRECATE_PRODUCT_QUESTIONS } from '../../questions';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  uuid: {
    type: 'string',
    description: 'The UUID of the product you want to deprecate',
  },
};

const handler = async () => {
  try {
    const { uuid } = await processAnswers<IDeprecateProductQuestionAnswers>(
      DEPRECATE_PRODUCT_QUESTIONS
    );

    await RequestBase<IProduct>({
      method: 'DELETE',
      endpoint: `products/${uuid}`,
    });

    log.success(`Product: ${uuid} deprecated succesfully`).exit(0);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const deprecateProduct: ICommand = {
  command: 'product',
  describe: 'Deprecate a product from your Salable account',
  builder,
  handler,
};
