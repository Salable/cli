import ErrorResponse from '../../error-response';
import { ICapability, ICommand, IListCapabilitiesQuestionAnswers } from '../../types';
import { RequestBase, log, processAnswers } from '../../utils';
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
      log.plain(JSON.stringify(productCapabilities));
      return;
    }

    const activeCapabilities =
      Array.isArray(productCapabilities) &&
      productCapabilities.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(activeCapabilities) && !activeCapabilities?.length) {
      log.warn(`No capabilities found`).exit(0);
    } else {
      log.plain(JSON.stringify(activeCapabilities)).exit(0);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const listCapabilities: ICommand = {
  command: 'capabilities',
  describe: 'List all the capabilities on a product',
  builder,
  handler,
};
