import 'isomorphic-fetch';
import { IRequestBase } from '../types';
import refreshTokens from './refresh-tokens';
import { getToken } from './salable-rc-utils';

export default async function RequestBase<T>({
  endpoint,
  method,
  body = {},
}: IRequestBase): Promise<T | undefined> {
  let attempts = 0;

  while (attempts < 2) {
    try {
      const token = await getToken('ACCESS_TOKEN');

      if (!token) {
        throw new Error(
          'No ACCESS_TOKEN could be found, please run `salable auth` to reauthenticate.'
        );
      }

      const res = await fetch(`https://salable.org/api/2.0/${endpoint}`, {
        method,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // If not a GET Request then add in the body property
        ...(method !== 'GET' && {
          body: JSON.stringify(body),
        }),
      });

      const data = (await res.json()) as Promise<T>;

      // If response status is not successful, throw an error to retry
      if (res.status < 200 || res.status >= 300) {
        throw new Error('Fetch request to Salable API failed');
      }

      return data;
    } catch (e) {
      // If the request fails, refresh the tokens and try again
      await refreshTokens();
      attempts += 1;
    }
  }
  throw new Error('Fetch request retry failed...');
}
