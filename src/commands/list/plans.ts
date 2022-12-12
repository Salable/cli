import ErrorResponse from '../../error-response';
import { ICommand, IListPlansQuestionAnswers, IPlan } from '../../types';
import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import { processAnswers } from '../../utils/process-answers';
import inquirer, { Answers } from 'inquirer';
import { LIST_PLANS_QUESTIONS } from '../../questions';

const builder = {
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
    const answers: Answers = await inquirer.prompt(LIST_PLANS_QUESTIONS);

    const { showDeprecated, productUuid } =
      processAnswers<IListPlansQuestionAnswers>(answers);

    const productPlans = await RequestBase<IPlan[]>({
      method: 'GET',
      endpoint: `products/${productUuid}/plans`,
    });

    if (showDeprecated === 'true') {
      console.log(productPlans);
      return;
    }

    const activePlans =
      Array.isArray(productPlans) &&
      productPlans.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(activePlans) && !activePlans?.length) {
      console.log(chalk.yellow(`No plans found`));
    } else {
      console.log(activePlans);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const listPlans: ICommand = {
  command: 'plans',
  describe: 'List all the plans on a product',
  builder,
  handler,
};
