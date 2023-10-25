import ErrorResponse from '../../error-response';
import { ICommand, IFeature, IListFeaturesQuestionAnswers } from '../../types';
import { RequestBase, log, processAnswers } from '../../utils';
import { LIST_FEATURES_QUESTIONS } from '../../questions';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  productUuid: {
    type: 'string',
    description: 'The product UUID to show the features for',
  },
};

const handler = async () => {
  try {
    const { productUuid } = await processAnswers<IListFeaturesQuestionAnswers>(
      LIST_FEATURES_QUESTIONS
    );

    const productFeatures = await RequestBase<IFeature[]>({
      method: 'GET',
      endpoint: `products/${productUuid}/features`,
    });

    if (!productFeatures?.length) {
      log.warn(`No features found`).exit(0);
    } else {
      log.plain(JSON.stringify(productFeatures)).exit(0);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const listFeatures: ICommand = {
  command: 'features',
  describe: 'List all the features on a product',
  builder,
  handler,
};
