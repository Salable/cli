import { RequestBase, processAnswers } from '../../utils';
import chalk from 'chalk';
import ErrorResponse from '../../error-response';
import { ICommand, IDeprecatePlanQuestionAnswers, IProduct } from '../../types';
import { DEPRECATE_PLAN_QUESTIONS } from '../../questions';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  uuid: {
    type: 'string',
    description: 'The UUID of the plan you want to deprecate',
  },
};

const handler = async () => {
  try {
    const { uuid } = await processAnswers<IDeprecatePlanQuestionAnswers>(
      DEPRECATE_PLAN_QUESTIONS
    );

    await RequestBase<IProduct>({
      method: 'DELETE',
      endpoint: `plans/${uuid}`,
    });

    console.log(chalk.green(`Plan: ${uuid} deprecated succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const deprecatePlan: ICommand = {
  command: 'plan',
  describe: 'Deprecate a plan from a product on your Salable account',
  builder,
  handler,
};
