import { RequestBase, log, processAnswers } from '../../utils';
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
    const { uuid } = await processAnswers<IDeprecatePlanQuestionAnswers>(DEPRECATE_PLAN_QUESTIONS);

    await RequestBase<IProduct>({
      method: 'DELETE',
      endpoint: `plans/${uuid}`,
    });

    log.success(`Plan: ${uuid} deprecated succesfully`).exit(0);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const deprecatePlan: ICommand = {
  command: 'plan',
  describe: 'Deprecate a plan from a product on your Salable account',
  builder,
  handler,
};
