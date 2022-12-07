import chalk from 'chalk';
import inquirer, { Answers } from 'inquirer';
import { isProd } from '../../config';
import {
  ARGUMENT_SEPARATOR,
  COMMAND_BASE,
  CREATE_PRODUCT_NAME_QUESTION_OPTION,
} from '../../constants';
import ErrorResponse from '../../error-response';
import {
  CREATE_CAPABILITY_CAPABILITY_NAME_QUESTION,
  CREATE_CAPABILITY_PRODUCT_NAME_QUESTION,
  CREATE_PRODUCT_QUESTIONS,
} from '../../questions';
import {
  ICapability,
  ICommand,
  ICreateCapabilityQuestionAnswers,
  ICreateProductQuestionAnswers,
  IProduct,
} from '../../types';
import { execPromise } from '../../utils/execPromise';
import { fetchData } from '../../utils/fetch-data';
import { processAnswers } from '../../utils/processAnswers';
import { RequestBase } from '../../utils/request-base';

const PRODUCT_NAME_CHOICES = [CREATE_PRODUCT_NAME_QUESTION_OPTION];
const PRODUCT_NAME_QUESTION =
  CREATE_CAPABILITY_PRODUCT_NAME_QUESTION(PRODUCT_NAME_CHOICES);

const builder = {
  productName: {
    type: 'string',
    description: 'The product to create the capability on',
    default: '',
  },
  name: {
    type: 'string',
    description: 'The name of the capability',
    default: '',
  },
};

const handler = async () => {
  try {
    let loopCreate = false;
    let productName = '';
    let products: IProduct[] = [];

    while (!loopCreate) {
      const { data, choices } = await fetchData<IProduct>({
        choices: PRODUCT_NAME_CHOICES,
        endpoint: 'products',
      });

      products = data;
      PRODUCT_NAME_QUESTION.choices = choices;

      const productNameAnswers: Answers = await inquirer.prompt(
        PRODUCT_NAME_QUESTION
      );

      productName =
        processAnswers<ICreateCapabilityQuestionAnswers>(productNameAnswers)[
          'productName'
        ];

      if (productName === CREATE_PRODUCT_NAME_QUESTION_OPTION) {
        const createProductAnswers: Answers = await inquirer.prompt(
          CREATE_PRODUCT_QUESTIONS
        );

        const { name, displayName, productDescription } =
          processAnswers<ICreateProductQuestionAnswers>(createProductAnswers);

        const CREATE_PRODUCT_COMMAND = `${COMMAND_BASE} create product ${ARGUMENT_SEPARATOR} --name="${name}" --displayName="${displayName}" --productDescription="${productDescription}"`;

        const { stdout, stderr } = await execPromise(CREATE_PRODUCT_COMMAND);

        console.log(chalk.green(stdout));

        if (stderr && isProd) {
          console.log(chalk.red(stderr));
          process.exit(1);
        }
      } else {
        loopCreate = true;
      }
    }

    const capabilityNameAnswer: Answers = await inquirer.prompt(
      CREATE_CAPABILITY_CAPABILITY_NAME_QUESTION
    );

    const { name: capabilityName } =
      processAnswers<ICreateCapabilityQuestionAnswers>(capabilityNameAnswer);

    await RequestBase<ICapability>({
      method: 'POST',
      endpoint: 'capabilities',
      body: {
        productUuid:
          products?.find(({ name }) => name === productName)?.uuid || '',
        name: capabilityName,
      },
    });

    console.log(
      chalk.green(
        `Capability: ${capabilityName} created succesfully on ${productName}`
      )
    );
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const createCapability: ICommand = {
  command: 'capability',
  describe: 'Create a new capability for a product',
  builder,
  handler,
};
