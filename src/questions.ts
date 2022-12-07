import yargs from 'yargs';

export const CREATE_PRODUCT_QUESTIONS = [
  {
    name: 'name',
    type: 'input',
    message: 'Product name to use in Salable Backend: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('name'),
  },
  {
    name: 'displayName',
    type: 'input',
    message: 'Product name to show in Pricing Tables: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('displayName'),
  },
  {
    name: 'productDescription',
    type: 'input',
    message: 'Description of your product: ',
    when: () =>
      !Object.keys(yargs(process.argv).argv).includes('productDescription'),
  },
];

export const CREATE_CAPABILITY_PRODUCT_NAME_QUESTION = (
  PRODUCT_NAME_CHOICES: string[]
) => ({
  name: 'productName',
  type: 'list',
  message: 'What product would you like to create the capability on: ',
  choices: PRODUCT_NAME_CHOICES,
  when: () => !Object.keys(yargs(process.argv).argv).includes('productName'),
});

export const CREATE_CAPABILITY_CAPABILITY_NAME_QUESTION = {
  name: 'name',
  type: 'input',
  message: 'What would you like to call the capability: ',
  when: () => !Object.keys(yargs(process.argv).argv).includes('name'),
};

export const CREATE_API_KEY_QUESTIONS = [
  {
    name: 'name',
    type: 'input',
    message: 'What would you like to name the API key: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('name'),
  },
];

export const CREATE_APP_API_KEY_QUESTION = (API_KEY_CHOICES: string[]) => ({
  name: 'apiKey',
  type: 'list',
  message: 'What api-key would you like to uset to generate the project?',
  choices: API_KEY_CHOICES,
  when: () => !Object.keys(yargs(process.argv).argv).includes('apiKey'),
});

export const CREATE_APP_QUESTIONS = (TEMPLATE_CHOICES: string[]) => [
  {
    name: 'template',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: TEMPLATE_CHOICES,
    when: () => !Object.keys(yargs(process.argv).argv).includes('template'),
  },
  {
    name: 'name',
    type: 'input',
    message: 'Project name:',
    when: () => !Object.keys(yargs(process.argv).argv).includes('name'),
    validate: (input: string) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return 'Project name may only include letters, numbers, underscores and hashes.';
    },
  },
];

export const DEPRECATE_API_KEY_QUESTIONS = [
  {
    name: 'value',
    type: 'input',
    message: 'API key value to deprecate: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('value'),
  },
];

export const DEPRECATE_PRODUCT_QUESTIONS = [
  {
    name: 'uuid',
    type: 'input',
    message: 'Product UUID to deprecate: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('uuid'),
  },
];

export const DEPRECATE_CAPABILITY_QUESTIONS = [
  {
    name: 'uuid',
    type: 'input',
    message: 'Capability UUID to deprecate: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('uuid'),
  },
];

export const LIST_CAPABILITY_QUESTIONS = [
  {
    name: 'productUuid',
    type: 'input',
    message: 'Product UUID to show capabilities for: ',
    when: () => !Object.keys(yargs(process.argv).argv).includes('productUuid'),
  },
];
