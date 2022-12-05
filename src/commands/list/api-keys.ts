import yargs from 'yargs';
import ErrorResponse from '../../error-response';
import { IApiKey, ICommand } from '../../types';
import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';

const builder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated API keys as well as active ones',
  },
};

const handler = async () => {
  try {
    const ans = Object.assign({}, yargs(process.argv).argv) as {
      [key: string]: string;
    };

    const showDeprecated = ans['showDeprecated'];

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
