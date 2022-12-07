import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import inquirer, { Answers } from 'inquirer';
import ErrorResponse from '../../error-response';
import { ICommand, IDeprecateProductQuestionAnswers } from '../../types';
import { DEPRECATE_PRODUCT_QUESTIONS } from '../../questions';
import { processAnswers } from '../../utils/processAnswers';

const builder = {
  uuid: {
    type: 'string',
    description: 'The UUID of the product you want to deprecate',
  },
};

const handler = async () => {
  try {
    const answers: Answers = await inquirer.prompt(DEPRECATE_PRODUCT_QUESTIONS);

    const { uuid } = processAnswers<IDeprecateProductQuestionAnswers>(answers);

    await RequestBase({
      method: 'DELETE',
      endpoint: `products/${uuid}`,
    });

    console.log(chalk.green(`Product: ${uuid} deprecated succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const deprecateProduct: ICommand = {
  command: 'product',
  describe: 'Deprecate a product from your Salable account',
  builder,
  handler,
};
