import { IDecodedToken } from '../types';
import { getProperty } from './salable-rc-utils';

/**
 * Decode the ACCESS_TOKEN JWT to access the data inside it
 **/
export const decodeToken = async () => {
  const token = await getProperty('ACCESS_TOKEN');

  if (!token) return;

  const decodedToken = JSON.parse(
    Buffer.from(token?.split('.')[1], 'base64').toString()
  ) as IDecodedToken;

  return decodedToken;
};
