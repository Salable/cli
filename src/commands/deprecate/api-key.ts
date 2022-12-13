import chalk from 'chalk';
import inquirer, { Answers } from 'inquirer';
import { CommandBuilder } from 'yargs';
import ErrorResponse from '../../error-response';
import { DEPRECATE_API_KEY_QUESTIONS } from '../../questions';
import {
  IApiKey,
  ICommand,
  IDeprecateApiKeyQuestionAnswers,
} from '../../types';
import { processAnswers } from '../../utils/process-answers';
import { RequestBase } from '../../utils/request-base';

const builder: CommandBuilder = {
  value: {
    type: 'string',
    description: 'The value of the API key to be deprecated',
    default: '',
  },
};

const handler = async () => {
  try {
    const answers: Answers = await inquirer.prompt(DEPRECATE_API_KEY_QUESTIONS);

    const { value } = processAnswers<IDeprecateApiKeyQuestionAnswers>(answers);

    await RequestBase<IApiKey>({
      method: 'DELETE',
      endpoint: `api-keys/${value}`,
    });

    console.log(chalk.green(`API key: ${value} deprecated succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const deprecateApiKey: ICommand = {
  command: 'api-key',
  describe: 'Deprecate an API key',
  builder,
  handler,
};
