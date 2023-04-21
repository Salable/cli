import { RequestBase, processAnswers } from '../../utils';
import chalk from 'chalk';
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

    // eslint-disable-next-line no-console
    console.log(chalk.green(`Product: ${uuid} deprecated succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const deprecateProduct: ICommand = {
  command: 'product',
  describe: 'Deprecate a product from your Salable account',
  builder,
  handler,
};
