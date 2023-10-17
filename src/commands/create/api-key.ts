import { decodeToken, RequestBase, processAnswers, log } from '../../utils';
import ErrorResponse from '../../error-response';
import { IApiKey, IApiKeyScopes, ICommand, ICreateApiKeyQuestionAnswers, IUser } from '../../types';
import { CREATE_API_KEY_QUESTIONS } from '../../questions';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  name: {
    type: 'string',
    description: 'The name of the API key',
    default: '',
  },
};

const handler = async () => {
  try {
    const { name } = await processAnswers<ICreateApiKeyQuestionAnswers>(CREATE_API_KEY_QUESTIONS);

    const tokenValues = await decodeToken();

    if (!tokenValues) {
      log.error('Something went wrong. Please try again...');
      return;
    }

    const { sub } = tokenValues.payload;

    const userRbacData = await RequestBase<IUser>({
      method: 'GET',
      endpoint: `/users/${sub}`,
    });

    if (!userRbacData?.permissions.includes('apiKey:write')) {
      log.error("You currently don't have permission to create API keys in this organisation.");
      return;
    }

    const apiKeyScopes = await RequestBase<IApiKeyScopes>({
      method: 'GET',
      endpoint: `/cli/api-scopes`,
    });

    if (!userRbacData || !apiKeyScopes) {
      log.error('Something went wrong. Please try again...');
      return;
    }

    const res = await RequestBase<IApiKey>({
      method: 'POST',
      endpoint: 'api-keys',
      body: {
        name,
        sub: sub,
        scopes: apiKeyScopes.Admin,
        roles: ['Admin'],
      },
    });

    log.success(`API key "${name}" created succesfully with value: ${res ? res?.value : ''}`);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const createApiKey: ICommand = {
  command: 'api-key',
  describe: 'Create a new API key',
  builder,
  handler,
};
