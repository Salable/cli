import 'isomorphic-fetch';
import { SALABLE_API_ENDPOINT } from '../constants';
import ErrorResponse from '../error-response';
import { HttpStatusCodes, IRequestBase } from '../types';
import { refreshTokens } from './refresh-tokens';

import { getToken } from './salable-rc-utils';

export const RequestBase = async <T>({
  endpoint,
  method,
  body,
}: IRequestBase): Promise<T | undefined | void> => {
  try {
    let data;
    const token = await getToken('ACCESS_TOKEN');

    if (!token) {
      throw new ErrorResponse(
        HttpStatusCodes.badRequest,
        'Access token is invalid'
      );
    }

    const res = await fetch(`${SALABLE_API_ENDPOINT}${endpoint}`, {
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

    if (res.status === HttpStatusCodes.badRequest) {
      // If the request fails with an invalid token, refresh the tokens and try the request again
      await refreshTokens();

      return await RequestBase({
        endpoint,
        method,
        ...(method !== 'GET' && body),
      });
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

    return data as Promise<T>;
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // Throw the error from the reponse
    throw new ErrorResponse(e.statusCode, e.message);
  }
};
