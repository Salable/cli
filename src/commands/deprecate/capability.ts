import { RequestBase, log, processAnswers } from '../../utils';
import ErrorResponse from '../../error-response';
import { ICapability, ICommand, IDeprecateCapabilityQuestionAnswers } from '../../types';
import { DEPRECATE_CAPABILITY_QUESTIONS } from '../../questions';
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

    log.success(`Capability: ${uuid} deprecated succesfully`).exit(0);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const deprecateCapability: ICommand = {
  command: 'capability',
  describe: 'Deprecate a capability from a product',
  builder,
  handler,
};
