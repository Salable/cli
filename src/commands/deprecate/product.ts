import chalk from 'chalk';
import inquirer from 'inquirer';
import yargs from 'yargs';
import ErrorResponse from '../../error-response';
import { ICommand } from '../../types';
import RequestBase from '../../utils/request-base';

const QUESTIONS = [
  {
    name: 'uuid',
    type: 'input',
    message: 'Product UUID to deprecate: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('uuid'),
  },
];

const builder = {
  uuid: {
    type: 'string',
    description: 'The UUID of the product you want to deprecate',
  },
};

const handler = async () => {
  try {
    const answers = await inquirer.prompt(QUESTIONS);

    const ans = Object.assign({}, answers, yargs(process.argv).argv) as {
      [key: string]: string;
    };

    const uuid = ans['uuid'];

    await RequestBase({
      method: 'DELETE',
      endpoint: `products/${uuid}`,
    });

    console.log(chalk.green(`Product: ${uuid} deprecated succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const deprecateProduct: ICommand = {
  command: 'product',
  describe: 'Deprecate a product from your Salable account',
  builder,
  handler,
};
