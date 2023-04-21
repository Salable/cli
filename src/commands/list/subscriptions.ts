import ErrorResponse from '../../error-response';
import { ICommand, IListSubscriptionsQuestionAnswers, ISubscription } from '../../types';
import chalk from 'chalk';
import { RequestBase, processAnswers } from '../../utils';
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
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`No subscriptions found`));
      return;
    }

    const { data: subscriptions } = response;

    if (showSuspended === 'true') {
      // eslint-disable-next-line no-console
      console.log(subscriptions);
      return;
    }

    const activeSubscriptions =
      Array.isArray(subscriptions) && subscriptions.filter(({ status }) => status !== 'CANCELED');

    if (Array.isArray(subscriptions) && !subscriptions.length) {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`No subscriptions found`));
    } else {
      // eslint-disable-next-line no-console
      console.log(activeSubscriptions);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const listSubscriptions: ICommand = {
  command: 'subscriptions',
  describe: 'List all the subscriptions from your Salable account',
  builder,
  handler,
};
