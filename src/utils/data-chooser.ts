import chalk from 'chalk';
import { Question } from 'inquirer';
import { isProd } from '../config';
import {
  ARGUMENT_SEPARATOR,
  COMMAND_BASE,
  CREATE_ITEM_QUESTION_OPTIONS,
} from '../constants';
import {
  CREATE_API_KEY_QUESTIONS,
  CREATE_PRODUCT_QUESTIONS,
} from '../questions';
import { execPromise } from './exec-promise';
import { fetchData } from './fetch-data';
import { processAnswers } from './process-answers';

interface IProps {
  question: Question;
  startingChoices: string[];
  endpoint: string;
  targetField: string;
}

const createQuestionSwitch = (endpoint: string) => {
  switch (endpoint) {
    case 'products':
      return CREATE_PRODUCT_QUESTIONS;
    case 'api-keys':
      return CREATE_API_KEY_QUESTIONS;
    default:
      return undefined;
  }
};

const createCommandSwitch = (
  endpoint: string,
  commandProps: { [key: string]: string }
) => {
  switch (endpoint) {
    case 'products':
      return `${COMMAND_BASE} create product ${ARGUMENT_SEPARATOR} --name="${commandProps?.name}" --displayName="${commandProps?.displayName}" --productDescription="${commandProps?.productDescription}"`;

    case 'api-keys':
      return `${COMMAND_BASE} create api-key ${ARGUMENT_SEPARATOR} --name="${commandProps?.name}"`;
    default:
      return '';
  }
};

/**
 * Generic function to loop over a given type of data and allow the user to either select one from the existing data or create a new one.
 *
 * **Generic Type Definitions:**
 *
 * T ➡️ Type of data for the user to pick from. E.g. `IProduct`
 *
 * K ➡️ Type for the answers for the questions for the requesting command. E.g. if a capability is being created it would be `ICreateCapabilityQuestionAnswers`
 *
 * L ➡️ Type for the answers for the type of data the user is being asked to choose from. E.g if they're choosing from a list of products, it would be `ICreateProductQuestionAnswers`
 **/
export const dataChooser = async <
  T extends { name: string; status: string },
  K,
  L
>({
  question,
  startingChoices,
  endpoint,
  targetField,
}: IProps) => {
  let loopCreate = true;
  let name = '';
  let data: T[] = [];

  while (loopCreate) {
    // 1. Fetch the requested data from the endpoint provided
    const { data: retrievedData, choices } = await fetchData<T>({
      choices: startingChoices,
      endpoint,
    });

    data = retrievedData;
    question.choices = choices;

    // 2. Prompt the user to select from the updated choices
    const questionData = await processAnswers<K>(question);

    // 3. Retrieve the answer from the question asked using the targetField for the property name.
    name = questionData[targetField] as string;

    // 4. If the option selected is one of the 'Create a new XXX' constants, then run the commands to create a new XXX
    if (CREATE_ITEM_QUESTION_OPTIONS.includes(name)) {
      // 4a. Propmpt the user with the relevant create new questions based on the endpoint provided
      const createData = (await processAnswers<L>(
        createQuestionSwitch(endpoint)
      )) as {
        [key: string]: string;
      };

      // 4b. Execute the create command using the data from the questions above
      const { stdout, stderr } = await execPromise(
        createCommandSwitch(endpoint, { ...createData })
      );

      // 4c. Log the output of the create command above
      console.log(chalk.green(stdout));

      if (stderr && isProd) {
        console.log(chalk.red(stderr));
        process.exit(1);
      }
    } else {
      loopCreate = false;
    }
  }

  // 5. Find the item they have selected in the loop and return it
  const selectedItem = data?.find((d) => d?.name === name);

  return selectedItem;
};
