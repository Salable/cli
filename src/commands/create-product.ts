import chalk from 'chalk';
import inquirer from 'inquirer';
import yargs from 'yargs';
import RequestBase from '../utils/request-base';

const QUESTIONS = [
  {
    name: 'name',
    type: 'input',
    message: 'Product name to use in Salable Backend: ',
    when: () => !Object.keys(yargs.argv).includes('name'),
  },
  {
    name: 'displayName',
    type: 'input',
    message: 'Product name to show in Pricing Tables: ',
    when: () => !Object.keys(yargs.argv).includes('displayName'),
  },
  {
    name: 'productDescription',
    type: 'input',
    message: 'Description of your product: ',
    when: () => !Object.keys(yargs.argv).includes('productDescription'),
  },
];

const builder = {
  name: {
    type: 'string',
    description: 'The name of the product for the Salable Backend',
    default: '',
  },
  displayName: {
    type: 'string',
    description: 'The name of the product to show in Pricing Tables',
    default: '',
  },
  productDescription: {
    type: 'string',
    description: 'The description of the product for tooltips in Salable',
    default: '',
  },
};

const handler = async () => {
  try {
    const answers = await inquirer.prompt(QUESTIONS);

    const ans = Object.assign({}, answers, yargs.argv) as {
      [key: string]: string;
    };

    const name = ans['name'];
    const displayName = ans['displayName'];
    const description = ans['productDescription'];

    await RequestBase({
      method: 'POST',
      endpoint: 'products',
      body: {
        name,
        displayName,
        description,
        paid: false,
      },
    });

    console.log(chalk.green(`Product: ${name} created succesfully`));
  } catch (e) {
    console.error(chalk.red(e));
  }
};

export const createProduct = {
  command: 'create-product',
  desc: 'Create a new product on your Salable account',
  builder,
  handler,
};
