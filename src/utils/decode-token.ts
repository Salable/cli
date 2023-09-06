import { decodeJwt } from '@clerk/clerk-sdk-node';
import { getProperty } from './salable-rc-utils';

/**
 * Decode the ACCESS_TOKEN JWT to access the data inside it
 **/
export const decodeToken = async () => {
  const token = await getProperty('ACCESS_TOKEN');

  if (!token) return;

  return decodeJwt(token);
};
