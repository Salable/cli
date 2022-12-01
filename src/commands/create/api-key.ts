import { decodeToken } from '../../utils/decode-token';
import chalk from 'chalk';
import inquirer from 'inquirer';
import yargs from 'yargs';
import ErrorResponse from '../../error-response';
import { IApiKey, ICommand } from '../../types';
import { RequestBase } from '../../utils/request-base';

const QUESTIONS = [
  {
    name: 'name',
    type: 'input',
    message: 'What would you like to name the API key: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('name'),
  },
];

const builder = {
  name: {
    type: 'string',
    description: 'The name of the API key',
    default: '',
  },
};

const handler = async () => {
  try {
    const answers = await inquirer.prompt(QUESTIONS);

    const ans = Object.assign({}, answers, yargs(process.argv).argv) as {
      [key: string]: string;
    };

    const name = ans['name'];

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
