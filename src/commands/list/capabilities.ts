import ErrorResponse from '../../error-response';
import {
  ICapability,
  ICommand,
  IListCapabilitiesQuestionAnswers,
} from '../../types';
import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import { processAnswers } from '../../utils/processAnswers';
import inquirer, { Answers } from 'inquirer';
import { LIST_CAPABILITY_QUESTIONS } from '../../questions';

const builder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated capabilities as well as active ones',
  },
  productUuid: {
    type: 'string',
    description: 'The product UUID to show the capabilities for',
  },
};

const handler = async () => {
  try {
    const answers: Answers = await inquirer.prompt(LIST_CAPABILITY_QUESTIONS);

    const { showDeprecated, productUuid } =
      processAnswers<IListCapabilitiesQuestionAnswers>(answers);

    const productCapabilities = await RequestBase<ICapability[]>({
      method: 'GET',
      endpoint: `products/${productUuid}/capabilities`,
    });

    if (showDeprecated === 'true') {
      console.log(productCapabilities);
      return;
    }

    const activeCapabilities =
      Array.isArray(productCapabilities) &&
      productCapabilities.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(activeCapabilities) && !activeCapabilities?.length) {
      console.log(chalk.yellow(`No capabilities found`));
    } else {
      console.log(activeCapabilities);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const listCapabilities: ICommand = {
  command: 'capabilities',
  describe: 'List all the capabilities on a product',
  builder,
  handler,
};
