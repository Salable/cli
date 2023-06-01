import ErrorResponse from '../../error-response';
import { ICommand, IFeature, IListFeaturesQuestionAnswers } from '../../types';
import { RequestBase, processAnswers } from '../../utils';
import chalk from 'chalk';
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
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`No features found`));
    } else {
      // eslint-disable-next-line no-console
      console.log(productFeatures);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const listFeatures: ICommand = {
  command: 'features',
  describe: 'List all the features on a product',
  builder,
  handler,
};