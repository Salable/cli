import {
  Auth0LoginProcessor,
  tryGetComboToken,
} from '@altostra/cli-login-auth0';
import path from 'path';
import { isProd } from '../config';
import {
  AUTH0_CLIENT_ID,
  AUTH0_DOMAIN,
  AUTH0_TOKEN_AUDIENCE,
} from '../constants';
import ErrorResponse from '../error-response';
import {
  createSalableRc,
  salableRcExists,
  updateSalableRc,
} from '../utils/salable-rc-utils';
import chalk from 'chalk';
import { ICommand } from '../types';

const handler = async () => {
  const basePath = isProd ? path.join(__dirname, './auth/') : './src/auth/';

  const loginProcessor = new Auth0LoginProcessor(
    {
      auth0ClientId: AUTH0_CLIENT_ID,
      auth0Domain: AUTH0_DOMAIN,
      auth0TokenAudience: AUTH0_TOKEN_AUDIENCE,
      auth0TokenScope: 'offline_access',
      port: 42224,
      timeout: 60000,
      successfulLoginHtmlFile: path.resolve(`${basePath}success.html`),
      failedLoginHtmlFile: path.resolve(`${basePath}error.html`),
    },
    tryGetComboToken
  );

  try {
    const result = await loginProcessor.runLoginProcess();

    if (salableRcExists) {
      await updateSalableRc('ACCESS_TOKEN', result.access_token);
      await updateSalableRc('REFRESH_TOKEN', result.refresh_token);
    } else {
      createSalableRc(result.access_token, result.refresh_token);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
    process.exit(1);
  }

  process.exit(0);
};

export const auth: ICommand = {
  command: 'auth',
  describe: 'Authenticate with your Salable Account',
  handler,
};
