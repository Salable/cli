import { decodeToken } from '../../utils/decode-token';
import chalk from 'chalk';
import inquirer, { Answers } from 'inquirer';
import ErrorResponse from '../../error-response';
import { IApiKey, ICommand, ICreateApiKeyQuestionAnswers } from '../../types';
import { RequestBase } from '../../utils/request-base';
import { CREATE_API_KEY_QUESTIONS } from '../../questions';
import { processAnswers } from '../../utils/process-answers';

const builder = {
  name: {
    type: 'string',
    description: 'The name of the API key',
    default: '',
  },
};

const handler = async () => {
  try {
    const answers: Answers = await inquirer.prompt(CREATE_API_KEY_QUESTIONS);

    const { name } = processAnswers<ICreateApiKeyQuestionAnswers>(answers);

    const tokenValues = await decodeToken();

    const res = await RequestBase<IApiKey>({
      method: 'POST',
      endpoint: 'api-keys',
      body: {
        name,
        sub: tokenValues?.sub || '',
        scopes: tokenValues?.permissions || [''],
        roles: ['Admin'],
      },
    });

    console.log(
      chalk.green(
        `API key "${name}" created succesfully with value: ${
          res ? res?.value : ''
        }`
      )
    );
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const createApiKey: ICommand = {
  command: 'api-key',
  describe: 'Create a new API key',
  builder,
  handler,
};
