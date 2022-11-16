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

      const res = fetch(`https://salable.org/api/2.0/${endpoint}`, {
        method,
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // If not a GET Request then add in the body property
        ...(method !== 'GET'
          ? {
              body: JSON.stringify(body),
            }
          : {}),
      });

      if ((await res).status !== 200) {
        throw new Error('Fetch request failed');
      }

      return (await (await res).json()) as Promise<T>;
    } catch (e) {
      // If the request fails, refresh the tokens and try again
      await refreshTokens();
      attempts += 1;
    }
  }
  return;
}
