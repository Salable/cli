import * as dotenv from 'dotenv';
import { isProd } from './config';

dotenv.config();

// Envs
export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
export const AUTH0_TOKEN_AUDIENCE = process.env.AUTH0_TOKEN_AUDIENCE || '';

// Commands
export const COMMAND_BASE = isProd ? 'salable' : 'npm run start';
export const ARGUMENT_SEPARATOR = isProd ? '' : '--';

// Question Options

export const CREATE_PRODUCT_NAME_QUESTION_OPTION = 'Create a new product';
export const CREATE_API_KEY_QUESTION_OPTION = 'Create a new API Key';
export const CREATE_ITEM_QUESTION_OPTIONS = [
  CREATE_PRODUCT_NAME_QUESTION_OPTION,
  CREATE_API_KEY_QUESTION_OPTION,
];
export const CREATE_FEATURE_QUESTIONS = {
  TEXT_PLAN_MENU: {
    CREATE: 'Create a new text option',
    DELETE: 'Delete a text option',
    CONTINUE: 'Continue',
  },
};
