import ErrorResponse from '../../error-response';
import { ICommand, IListSubscriptionsQuestionAnswers, ISubscription } from '../../types';
import { RequestBase, log, processAnswers } from '../../utils';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  showSuspended: {
    type: 'boolean',
    description: 'Show suspended subscriptions as well as active ones',
  },
};

const handler = async () => {
  try {
    const { showSuspended } = await processAnswers<IListSubscriptionsQuestionAnswers>();

    const response = await RequestBase<{
      count: number;
      data: ISubscription[];
    }>({
      method: 'GET',
      endpoint: 'subscriptions',
    });

    if (!response) {
      log.warn(`No subscriptions found`);
      return;
    }

    const { data: subscriptions } = response;

    if (showSuspended === 'true') {
      log.plain<ISubscription[]>(subscriptions);
      return;
    }

    const activeSubscriptions =
      Array.isArray(subscriptions) && subscriptions.filter(({ status }) => status !== 'CANCELED');

    if (Array.isArray(subscriptions) && !subscriptions.length) {
      log.warn(`No subscriptions found`).exit(0);
    } else {
      log.plain(JSON.stringify(activeSubscriptions));
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const listSubscriptions: ICommand = {
  command: 'subscriptions',
  describe: 'List all the subscriptions from your Salable account',
  builder,
  handler,
};
