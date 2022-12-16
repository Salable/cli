import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import ErrorResponse from '../../error-response';
import {
  ICapability,
  ICommand,
  IDeprecateCapabilityQuestionAnswers,
} from '../../types';
import { DEPRECATE_CAPABILITY_QUESTIONS } from '../../questions';
import { processAnswers } from '../../utils/process-answers';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  uuid: {
    type: 'string',
    description: 'The UUID of the capability you want to deprecate',
  },
};

const handler = async () => {
  try {
    const { uuid } = await processAnswers<IDeprecateCapabilityQuestionAnswers>(
      DEPRECATE_CAPABILITY_QUESTIONS
    );

    await RequestBase<ICapability>({
      method: 'DELETE',
      endpoint: `capabilities/${uuid}`,
    });

    console.log(chalk.green(`Capability: ${uuid} deprecated succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const deprecateCapability: ICommand = {
  command: 'capability',
  describe: 'Deprecate a capability from a product',
  builder,
  handler,
};
