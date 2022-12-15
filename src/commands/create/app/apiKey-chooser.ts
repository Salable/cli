import chalk from 'chalk';
import { isProd } from '../../../config';
import {
  ARGUMENT_SEPARATOR,
  COMMAND_BASE,
  CREATE_API_KEY_QUESTION_OPTION,
} from '../../../constants';
import { CREATE_API_KEY_QUESTIONS } from '../../../questions';
import {
  IApiKey,
  ICreateApiKeyQuestionAnswers,
  ICreateAppQuestionAnswers,
} from '../../../types';
import { execPromise } from '../../../utils/exec-promise';
import { fetchData } from '../../../utils/fetch-data';
import { processAnswers } from '../../../utils/process-answers';

interface IProps {
  apiKeyQuestion: {
    name: string;
    type: string;
    message: string;
    choices: string[];
    when: () => boolean;
  };
  apiKeyChoices: string[];
}

export const apiKeyChooser = async ({
  apiKeyQuestion,
  apiKeyChoices,
}: IProps) => {
  let loopCreate = true;
  let apiKeys: IApiKey[] = [];
  let apiKeyName = '';

  while (loopCreate) {
    const { data, choices } = await fetchData<IApiKey>({
      choices: apiKeyChoices,
      endpoint: 'api-keys',
    });

    apiKeys = data;
    apiKeyQuestion.choices = choices;

    const { apiKey: selectedApiKeyName } =
      await processAnswers<ICreateAppQuestionAnswers>(apiKeyQuestion);

    apiKeyName = selectedApiKeyName;

    if (apiKeyName === CREATE_API_KEY_QUESTION_OPTION) {
      const { name } = await processAnswers<ICreateApiKeyQuestionAnswers>(
        CREATE_API_KEY_QUESTIONS
      );

      const CREATE_COMMAND = `${COMMAND_BASE} create api-key ${ARGUMENT_SEPARATOR} --name="${name}"`;

      const { stdout, stderr } = await execPromise(CREATE_COMMAND);

      console.log(chalk.green(stdout));

      if (stderr && isProd) {
        console.log(chalk.red(stderr));
        process.exit(1);
      }
    } else {
      loopCreate = true;
    }
  }

  // Find the apiKey they have selected
  const selectedApiKey = apiKeys?.find(({ name }) => name === apiKeyName);

  return { selectedApiKey };
};
