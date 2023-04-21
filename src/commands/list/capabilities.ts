import ErrorResponse from '../../error-response';
import { ICapability, ICommand, IListCapabilitiesQuestionAnswers } from '../../types';
import { RequestBase, processAnswers } from '../../utils';
import chalk from 'chalk';
import { LIST_CAPABILITY_QUESTIONS } from '../../questions';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
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
    const { showDeprecated, productUuid } = await processAnswers<IListCapabilitiesQuestionAnswers>(
      LIST_CAPABILITY_QUESTIONS
    );

    const productCapabilities = await RequestBase<ICapability[]>({
      method: 'GET',
      endpoint: `products/${productUuid}/capabilities`,
    });

    if (showDeprecated === 'true') {
      // eslint-disable-next-line no-console
      console.log(productCapabilities);
      return;
    }

    const activeCapabilities =
      Array.isArray(productCapabilities) &&
      productCapabilities.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(activeCapabilities) && !activeCapabilities?.length) {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`No capabilities found`));
    } else {
      // eslint-disable-next-line no-console
      console.log(activeCapabilities);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const listCapabilities: ICommand = {
  command: 'capabilities',
  describe: 'List all the capabilities on a product',
  builder,
  handler,
};
