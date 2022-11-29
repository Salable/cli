import chalk from 'chalk';
import inquirer from 'inquirer';
import yargs from 'yargs';
import ErrorResponse from '../../error-response';
import { ICommand } from '../../types';
import RequestBase from '../../utils/request-base';

const QUESTIONS = [
  {
    name: 'value',
    type: 'input',
    message: 'API key value to deprecate: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('value'),
  },
];

const builder = {
  value: {
    type: 'string',
    description: 'The value of the API key to be deprecated',
    default: '',
  },
};

const handler = async () => {
  try {
    const answers = await inquirer.prompt(QUESTIONS);

    const ans = Object.assign({}, answers, yargs(process.argv).argv) as {
      [key: string]: string;
    };

    const value = ans['value'];

    await RequestBase({
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
