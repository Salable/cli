import ErrorResponse from '../../error-response';
import { IApiKey, ICommand, IListApiKeysQuestionAnswers } from '../../types';
import { RequestBase, log, processAnswers } from '../../utils';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated API keys as well as active ones',
  },
};

const handler = async () => {
  try {
    const { showDeprecated } = await processAnswers<IListApiKeysQuestionAnswers>();

    const apiKeys = await RequestBase<IApiKey[]>({
      method: 'GET',
      endpoint: 'api-keys',
    });

    if (showDeprecated === 'true') {
      log.plain(JSON.stringify(apiKeys));
      return;
    }

    const activeApiKeys =
      Array.isArray(apiKeys) && apiKeys.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(activeApiKeys) && !activeApiKeys?.length) {
      log.warn('No API Keys found').exit(0);
    } else {
      log.plain(JSON.stringify(activeApiKeys)).exit(0);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const listApiKeys: ICommand = {
  command: 'api-keys',
  describe: 'List all the API keys from your Salable account',
  builder,
  handler,
};
