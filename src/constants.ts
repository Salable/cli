import * as dotenv from 'dotenv';

dotenv.config();

export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
export const AUTH0_TOKEN_AUDIENCE = process.env.AUTH0_TOKEN_AUDIENCE || '';
export const SALABLE_API_ENDPOINT = process.env.SALABLE_API_ENDPOINT || '';
