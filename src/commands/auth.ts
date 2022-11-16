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
import {
  createSalableRc,
  salableRcExists,
  updateSalableRc,
} from '../utils/salable-rc-utils';

const handler = async (): Promise<void> => {
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
  } catch (err) {
    console.error('Authentication failed', err);
    process.exit(1);
  }

  process.exit(0);
};

export const auth = {
  command: 'auth',
  desc: 'Authenticate with your Salable Account',
  handler,
};
