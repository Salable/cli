import ErrorResponse from '../../error-response';
import { ICommand, IListPlansQuestionAnswers, IPlan } from '../../types';
import { RequestBase, log, processAnswers } from '../../utils';
import { LIST_PLANS_QUESTIONS } from '../../questions';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  showDeprecated: {
    type: 'boolean',
    description: 'Show depcrecated plans as well as active ones',
  },
  productUuid: {
    type: 'string',
    description: 'The product UUID to show the plans for',
  },
};

const handler = async () => {
  try {
    const { showDeprecated, productUuid } = await processAnswers<IListPlansQuestionAnswers>(
      LIST_PLANS_QUESTIONS
    );

    const productPlans = await RequestBase<IPlan[]>({
      method: 'GET',
      endpoint: `products/${productUuid}/plans`,
    });

    if (showDeprecated === 'true') {
      if (!productPlans) {
        log.warn('No plans found');
        return;
      }

      log.plain<IPlan[]>(productPlans);
      return;
    }

    const activePlans =
      Array.isArray(productPlans) && productPlans.filter(({ status }) => status !== 'DEPRECATED');

    if (Array.isArray(activePlans) && !activePlans?.length) {
      log.warn(`No plans found`).exit(0);
    } else {
      log.plain(JSON.stringify(activePlans));
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const listPlans: ICommand = {
  command: 'plans',
  describe: 'List all the plans on a product',
  builder,
  handler,
};
