import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import ErrorResponse from '../../error-response';
import {
  ICommand,
  ILicense,
  ISuspendSubscriptionQuestionAnswers,
} from '../../types';
import { SUSPEND_SUBSCRIPTION_QUESTIONS } from '../../questions';
import { processAnswers } from '../../utils/process-answers';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  uuid: {
    type: 'string',
    description: 'The UUID of the subscription you want to suspend',
  },
};

const handler = async () => {
  try {
    const { uuid, when } =
      await processAnswers<ISuspendSubscriptionQuestionAnswers>(
        SUSPEND_SUBSCRIPTION_QUESTIONS
      );

    const whenValue =
      when === 'End of the current billing period' ? 'end' : 'now';

    await RequestBase<ILicense>({
      method: 'PUT',
      endpoint: `subscriptions/${uuid}/cancel?when=${whenValue}`,
    });

    console.log(chalk.green(`Subscription: ${uuid} suspended succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const suspendSubscription: ICommand = {
  command: 'subscription',
  describe: 'Suspend a subscription from a product and plan',
  builder,
  handler,
};
