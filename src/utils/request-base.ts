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
    const token = await getToken('ACCESS_TOKEN');

    if (!token) {
      throw new ErrorResponse(HttpStatusCodes.badRequest, 'Access token is invalid');
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

    const { status: httpStatus } = res;

    // Get the data from the response
    const data = (await res.json()) as Promise<T> | string;

    // If the request fails with a bad request, refresh the tokens and try the request again
    if (httpStatus === HttpStatusCodes.badRequest && typeof data === 'string' && data?.length > 0) {
      await refreshTokens();

      return await RequestBase({
        endpoint,
        method,
        ...(method !== 'GET' && body),
      });
    }

    // If response status is not successful, throw an error to retry
    if (httpStatus < HttpStatusCodes.ok || httpStatus >= HttpStatusCodes.multipleChoices) {
      // 404 Error Message
      if (httpStatus === HttpStatusCodes.notFound) {
        throw new ErrorResponse(
          httpStatus,
          `Request to Salable API failed. Error Message: ${endpoint} not found`
        );
      }

      // 400 Error Message
      if (httpStatus === HttpStatusCodes.badRequest) {
        throw new ErrorResponse(
          httpStatus,
          `Request to Salable API failed. Error Message: ${(await res.json()) as string}`
        );
      }

      // Other error codes messages
      throw new ErrorResponse(
        httpStatus,
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
