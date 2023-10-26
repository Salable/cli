import 'isomorphic-fetch';
import { isProd } from '../config';
import ErrorResponse from '../error-response';
import { HttpStatusCodes, IRequestBase } from '../types';
import { getProperty } from './salable-rc-utils';
import { log } from './log';

export const RequestBase = async <T, K = void>({
  endpoint,
  method,
  body,
  command,
  hideTestModeWarning = false,
}: IRequestBase<K>): Promise<T | undefined | void> => {
  try {
    const token = await getProperty('ACCESS_TOKEN');
    const rfToken = await getProperty('REFRESH_TOKEN');
    const orgName = await getProperty('ORGANISATION');

    const testMode = (await getProperty('TEST_MODE')) || 'false';
    const isTest = testMode === 'true';

    if (command !== 'auth' && !token) {
      throw new ErrorResponse(HttpStatusCodes.badRequest, 'Access token is invalid');
    }

    if (command !== 'auth' && (rfToken || orgName)) {
      throw new ErrorResponse(
        HttpStatusCodes.badRequest,
        `Authentication with the Salable API failed. Please re-authenticate by using "salable auth"`
      );
    }

    const API_URL = `${isProd ? 'https' : 'http'}://${
      isProd ? 'salable.app' : `localhost:3000`
    }/api/2.0/`;

    if (isTest && hideTestModeWarning) {
      log.warn(`TEST MODE: Request being performed in test mode`);
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'content-type': 'application/json',
        referer: 'cli',
        'salable-test-mode': testMode,
        ...(command !== 'auth' ? { Cookie: `__session=${token || ''};` } : {}),
      },
      // If not a GET Request and body is truthy, add in the body property
      ...(method !== 'GET' &&
        body && {
          body: JSON.stringify({ ...body }),
        }),
    });

    const { status: httpStatus } = res;

    // Get the data from the response
    let data: Promise<T> | string = '';

    if (httpStatus !== HttpStatusCodes.notFound) {
      data = (await res.json()) as Promise<T> | string;
    }

    // If response status is not successful, throw an error to retry
    if (httpStatus < HttpStatusCodes.ok || httpStatus >= HttpStatusCodes.multipleChoices) {
      // 401 Error Message
      if (httpStatus === HttpStatusCodes.unauthorized) {
        throw new ErrorResponse(
          httpStatus,
          data.toString() ||
            `Authentication with the Salable API failed. Please re-authenticate by using "salable auth"`
        );
      }

      // 404 Error Message
      if (httpStatus === HttpStatusCodes.notFound) {
        throw new ErrorResponse(
          httpStatus,
          `Request to Salable API failed. Error Message: API endpoint: ${endpoint} not found`
        );
      }

      // 400 Error Message
      if (httpStatus === HttpStatusCodes.badRequest) {
        throw new ErrorResponse(
          httpStatus,
          `Request to Salable API failed. Error Message: ${data.toString()}`
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
