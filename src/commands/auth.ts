import {
  AUTH0_CLIENT_ID,
  AUTH0_DOMAIN,
  AUTH0_TOKEN_AUDIENCE,
} from '../constants';
import ErrorResponse from '../error-response';
import {
  createSalableRc,
  processAnswers,
  salableRcExists,
  updateSalableRc,
} from '../utils';
import chalk from 'chalk';
import { IAuthQuestionAnswers, ICommand } from '../types';
import {
  Auth0LoginProcessor,
  tryGetComboToken,
} from '../packages/auth0-login-processor';
import { AUTH_QUESTIONS } from '../questions';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  organisation: {
    type: 'string',
    description: 'The Salable organisation name to authenticate with.',
    default: '',
  },
};

const handler = async () => {
  // 1. Get the name of the organisation from the user
  const { organisation, username, password } =
    await processAnswers<IAuthQuestionAnswers>(AUTH_QUESTIONS);

  // 2. Create the login processor client
  const loginProcessor = new Auth0LoginProcessor(
    {
      auth0ClientId: AUTH0_CLIENT_ID,
      auth0Domain: AUTH0_DOMAIN,
      auth0TokenAudience: AUTH0_TOKEN_AUDIENCE,
      auth0TokenScope: 'offline_access',
      port: 42224,
      timeout: 30000,
      organisation,
      username,
      password,
    },
    tryGetComboToken
  );

  try {
    const result = await loginProcessor.runLoginProcess();

    // 3. Either update or create the .salablerc file with the new data
    if (salableRcExists) {
      await updateSalableRc('ACCESS_TOKEN', result.access_token);
      await updateSalableRc('REFRESH_TOKEN', result.refresh_token);
      await updateSalableRc('ORGANISATION', organisation);
    } else {
      createSalableRc(result.access_token, result.refresh_token, organisation);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    if (e.message !== 'Caught in ora') {
      console.error(chalk.red(e.message));
    }

    process.exit(1);
  }

  process.exit(0);
};

export const auth: ICommand = {
  command: 'auth',
  describe: 'Authenticate with your Salable Organisation',
  builder,
  handler,
};
