import 'isomorphic-fetch';
import ErrorResponse from '../error-response';
import { HttpStatusCodes, IRequestBase } from '../types';
import refreshTokens from './refresh-tokens';
import { getToken } from './salable-rc-utils';

export default async function RequestBase<T>({
  endpoint,
  method,
  body,
}: IRequestBase): Promise<T | undefined | string | void> {
  try {
    let data;
    const token = await getToken('ACCESS_TOKEN');

    if (!token) {
      throw new ErrorResponse(
        HttpStatusCodes.badRequest,
        'Access token is invalid'
      );
    }

    const res = await fetch(`https://salable.org/api/2.0/${endpoint}`, {
      method,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // If not a GET Request and body is truthy, add in the body property
      ...(method !== 'GET' &&
        body && {
          body: JSON.stringify(body),
        }),
    });

    if (res.status !== HttpStatusCodes.noContent) {
      data = (await res.json()) as Promise<T> | string;
    }

    if (
      res.status === HttpStatusCodes.badRequest &&
      data === 'Access token is invalid'
    ) {
      throw new ErrorResponse(res.status, data);
    }

    // If response status is not successful, throw an error to retry
    if (
      res.status < HttpStatusCodes.ok ||
      res.status >= HttpStatusCodes.multipleChoices
    ) {
      throw new ErrorResponse(
        res.status,
        `Request to Salable API failed. Error Message: ${
          typeof data === 'string' ? data : JSON.stringify(data)
        }`
      );
    }

    return data;
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    if (
      e.statusCode === HttpStatusCodes.badRequest &&
      e.message === 'Access token is invalid'
    ) {
      // If the request fails with an invalid token, refresh the tokens and try fetching again
      await refreshTokens();

      if (method !== 'GET') {
        await RequestBase({
          endpoint,
          method,
        });
      } else {
        await RequestBase({
          endpoint,
          method,
          body,
        });
      }
    } else {
      // If it fails for any other reason, throw the error as normal
      throw new ErrorResponse(e.statusCode, e.message);
    }
  }
}
