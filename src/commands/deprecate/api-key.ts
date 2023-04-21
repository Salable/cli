import chalk from 'chalk';
import { CommandBuilder } from 'yargs';
import ErrorResponse from '../../error-response';
import { DEPRECATE_API_KEY_QUESTIONS } from '../../questions';
import { IApiKey, ICommand, IDeprecateApiKeyQuestionAnswers } from '../../types';
import { processAnswers, RequestBase } from '../../utils';

const builder: CommandBuilder = {
  value: {
    type: 'string',
    description: 'The value of the API key to be deprecated',
    default: '',
  },
};

const handler = async () => {
  try {
    const { value } = await processAnswers<IDeprecateApiKeyQuestionAnswers>(
      DEPRECATE_API_KEY_QUESTIONS
    );

    await RequestBase<IApiKey>({
      method: 'DELETE',
      endpoint: `api-keys/${value}`,
    });

    // eslint-disable-next-line no-console
    console.log(chalk.green(`API key: ${value} deprecated succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const deprecateApiKey: ICommand = {
  command: 'api-key',
  describe: 'Deprecate an API key',
  builder,
  handler,
};
