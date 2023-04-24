import 'isomorphic-fetch';
import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../constants';
import { IAuth0Tokens } from '../types';
import { getProperty, updateSalableRc } from './salable-rc-utils';

/**
 * Refresh both the `access_token` and `refresh_token` from Auth0 and update the `.salablerc` file.
 **/
export const refreshTokens = async () => {
  try {
    const res = fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: AUTH0_CLIENT_ID,
        refresh_token: await getProperty('REFRESH_TOKEN'),
      }),
    });

    const token = (await (await res).json()) as IAuth0Tokens;

    await updateSalableRc('ACCESS_TOKEN', token.access_token);
    await updateSalableRc('REFRESH_TOKEN', token.refresh_token);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};
