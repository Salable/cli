import ErrorResponse from '../../error-response';
import { ICommand, IListPlansQuestionAnswers, IPlan } from '../../types';
import { RequestBase, processAnswers } from '../../utils';
import chalk from 'chalk';
import { LIST_PLANS_QUESTIONS } from '../../questions';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated plans as well as active ones',
  },
  productUuid: {
    type: 'string',
    description: 'The product UUID to show the plans for',
  },
};

const handler = async () => {
  try {
    const { showDeprecated, productUuid } = await processAnswers<IListPlansQuestionAnswers>(
      LIST_PLANS_QUESTIONS
    );

    const productPlans = await RequestBase<IPlan[]>({
      method: 'GET',
      endpoint: `products/${productUuid}/plans`,
    });

    if (showDeprecated === 'true') {
      // eslint-disable-next-line no-console
      console.log(productPlans);
      return;
    }

    const activePlans =
      Array.isArray(productPlans) && productPlans.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(activePlans) && !activePlans?.length) {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`No plans found`));
    } else {
      // eslint-disable-next-line no-console
      console.log(activePlans);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const listPlans: ICommand = {
  command: 'plans',
  describe: 'List all the plans on a product',
  builder,
  handler,
};
