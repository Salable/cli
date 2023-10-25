import { CommandBuilder } from 'yargs';
import ErrorResponse from '../../error-response';
import { DEPRECATE_API_KEY_QUESTIONS } from '../../questions';
import { IApiKey, ICommand, IDeprecateApiKeyQuestionAnswers } from '../../types';
import { log, processAnswers, RequestBase } from '../../utils';

const builder: CommandBuilder = {
  value: {
    type: 'string',
    description: 'The value of the API key to be deprecated',
    default: '',
  },
};

const handler = async () => {
  try {
    const { value } = await processAnswers<IDeprecateApiKeyQuestionAnswers>(
      DEPRECATE_API_KEY_QUESTIONS
    );

    await RequestBase<IApiKey>({
      method: 'DELETE',
      endpoint: `api-keys/${value}`,
    });

    log.success(`API Key: ${value} deprecated succesfully`).exit(0);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const deprecateApiKey: ICommand = {
  command: 'api-key',
  describe: 'Deprecate an API key',
  builder,
  handler,
};
