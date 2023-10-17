import { RequestBase } from '../../utils/request-base';
import ErrorResponse from '../../error-response';
import { ICommand, ILicense, ISuspendSubscriptionQuestionAnswers } from '../../types';
import { SUSPEND_SUBSCRIPTION_QUESTIONS } from '../../questions';
import { processAnswers } from '../../utils/process-answers';
import { CommandBuilder } from 'yargs';
import { log } from '../../utils';

const builder: CommandBuilder = {
  uuid: {
    type: 'string',
    description: 'The UUID of the subscription you want to suspend',
  },
};

const handler = async () => {
  try {
    const { uuid, when } = await processAnswers<ISuspendSubscriptionQuestionAnswers>(
      SUSPEND_SUBSCRIPTION_QUESTIONS
    );

    const whenValue = when === 'End of the current billing period' ? 'end' : 'now';

    await RequestBase<ILicense>({
      method: 'PUT',
      endpoint: `subscriptions/${uuid}/cancel?when=${whenValue}`,
    });

    log.success(`Subscription: ${uuid} suspended succesfully`);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const suspendSubscription: ICommand = {
  command: 'subscription',
  describe: 'Suspend a subscription from a product and plan',
  builder,
  handler,
};
