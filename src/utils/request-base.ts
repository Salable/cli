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

    const { status, statusText } = res;

    // If the request is successful, get the data to be returned
    if (status === HttpStatusCodes.ok || status === HttpStatusCodes.created) {
      data = (await res.json()) as Promise<T> | string;
    }

    // If the request fails with an invalid token, refresh the tokens and try the request again
    if (status === HttpStatusCodes.badRequest && statusText !== 'Bad Request') {
      await refreshTokens();

      return await RequestBase({
        endpoint,
        method,
        ...(method !== 'GET' && body),
      });
    }

    // If response status is not successful, throw an error to retry
    if (
      status < HttpStatusCodes.ok ||
      status >= HttpStatusCodes.multipleChoices
    ) {
      // 404 Error Message
      if (status === HttpStatusCodes.notFound) {
        throw new ErrorResponse(
          status,
          `Request to Salable API failed. Error Message: ${endpoint} not found`
        );
      }

      // 400 Error Message
      if (status === HttpStatusCodes.badRequest) {
        throw new ErrorResponse(
          status,
          `Request to Salable API failed. Error Message: ${statusText}`
        );
      }

      // Other error codes messages
      throw new ErrorResponse(
        status,
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
