import ErrorResponse from '../../error-response';
import { IApiKey, ICommand, IListApiKeysQuestionAnswers } from '../../types';
import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import { processAnswers } from '../../utils/process-answers';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated API keys as well as active ones',
  },
};

const handler = async () => {
  try {
    const { showDeprecated } = processAnswers<IListApiKeysQuestionAnswers>();

    const apiKeys = await RequestBase<IApiKey[]>({
      method: 'GET',
      endpoint: 'api-keys',
    });

    if (showDeprecated === 'true') {
      console.log(apiKeys);
      return;
    }

    const activeApiKeys =
      Array.isArray(apiKeys) &&
      apiKeys.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(activeApiKeys) && !activeApiKeys?.length) {
      console.log(chalk.yellow(`No API keys found`));
    } else {
      console.log(activeApiKeys);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const listApiKeys: ICommand = {
  command: 'api-keys',
  describe: 'List all the API keys from your Salable account',
  builder,
  handler,
};
