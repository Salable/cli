import { Answers } from 'inquirer';
import yargs from 'yargs';

const isOptionNotPassed = (option: string) =>
  !Object.keys(yargs(process.argv).argv).includes(option);

export const CREATE_PRODUCT_QUESTIONS = [
  {
    name: 'name',
    type: 'input',
    message: 'Product name to use in Salable Backend: ',
    when: () => isOptionNotPassed('name'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Project name cannot be empty';
    },
  },
  {
    name: 'displayName',
    type: 'input',
    message: 'Product name to show in Pricing Tables: ',
    when: () => isOptionNotPassed('displayName'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Project display name cannot be empty';
    },
  },
  {
    name: 'productDescription',
    type: 'input',
    message: 'Description of your product: ',
    when: () => isOptionNotPassed('productDescription'),
  },
];

export const CREATE_CAPABILITY_QUESTIONS = {
  NAME: {
    name: 'name',
    type: 'input',
    message: 'What would you like to call the capability: ',
    when: () => isOptionNotPassed('name'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Capability name cannot be empty';
    },
  },
  PRODUCT_NAME: (PRODUCT_NAME_CHOICES: string[]) => ({
    name: 'productName',
    type: 'list',
    message: 'What product would you like to create the capability on: ',
    choices: PRODUCT_NAME_CHOICES,
    when: () => isOptionNotPassed('productName'),
  }),
};

export const CREATE_FEATURES_QUESTIONS = {
  PRODUCT_NAME: (PRODUCT_NAME_CHOICES: string[]) => ({
    name: 'productName',
    type: 'list',
    message: 'What product would you like to create the feature on: ',
    choices: PRODUCT_NAME_CHOICES,
    when: () => isOptionNotPassed('productName'),
  }),
  NAME: {
    name: 'name',
    type: 'input',
    message: 'What would you like to name the feature: ',
    when: () => isOptionNotPassed('name'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Feature name cannot be empty';
    },
  },
  DISPLAY_NAME: {
    name: 'displayName',
    type: 'input',
    message: 'What is the display name of the feature: ',
    when: () => isOptionNotPassed('displayName'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Feature display name cannot be empty';
    },
  },
  VARIABLE_NAME: {
    name: 'variableName',
    type: 'input',
    message: 'What is the variable name of the feature: ',
    default: (answers: Answers) => answers?.name as string,
    when: () => isOptionNotPassed('variableName'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Feature variable name cannot be empty';
    },
  },
  DESCRIPTION: {
    name: 'description',
    type: 'input',
    message: 'What is the description of the feature: ',
    when: () => isOptionNotPassed('description'),
  },
  VALUE_TYPE: {
    name: 'valueType',
    type: 'list',
    choices: ['true/false', 'numerical', 'text'],
    message: 'What is the value type of the feature: ',
    when: () => isOptionNotPassed('valueType'),
  },
  TRUE_FALSE_DEFAULT: (valueType: string) => ({
    name: 'trueFalseDefault',
    type: 'list',
    choices: ['true', 'false'],
    message: 'What is the default value: ',
    when: () =>
      isOptionNotPassed('trueFalseDefault') && valueType === 'true/false',
  }),
  NUMERICAL_SHOW_UNLIMITED: {
    name: 'showUnlimited',
    type: 'confirm',
    message: 'Should an unlimited option be added? ',
    when: () => isOptionNotPassed('showUnlimited'),
  },
  NUMERICAL_UNLIMITED_NUMBER_DEFAULT: {
    name: 'unlimitedNumberDefault',
    type: 'list',
    choices: ['Unlimited', 'Number'],
    message: 'Which field is the deafult option? ',
    when: (answers: Answers) =>
      isOptionNotPassed('unlimitedNumberDefault') &&
      (answers.showUnlimited as boolean),
  },
  NUMERICAL_NUMBER_DEFAULT: {
    name: 'numberDefault',
    type: 'number',
    message: 'Which number should be the default? ',
    when: (answers: Answers) => {
      return (
        isOptionNotPassed('numberDefault') &&
        (!answers.showUnlimited || answers.unlimitedNumberDefault === 'Number')
      );
    },
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'A default numerical value is required';
    },
  },
  PLAN_NUMERICAL_UNLIMITED_NUMBER_DEFAULT: (
    answers: Answers,
    planName: string
  ) => ({
    name: 'planUnlimitedNumberDefault',
    type: 'list',
    choices: ['Unlimited', 'Number'],
    message: `Which field is the deafult option for plan: ${planName}?`,
    when: () =>
      isOptionNotPassed('planUnlimitedNumberDefault') &&
      (answers.showUnlimited as boolean),
  }),
  PLAN_NUMERICAL_NUMBER_DEFAULT: (planAnswers: Answers, planName: string) => ({
    name: 'planNumberDefault',
    type: 'number',
    message: `Which number should be the default for the plan: ${planName}?`,
    when: (answers: Answers) => {
      return (
        isOptionNotPassed('planNumberDefault') &&
        (!planAnswers.showUnlimited ||
          answers.planUnlimitedNumberDefault === 'Number')
      );
    },
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'A default numerical value for the plan is required';
    },
  }),
  TEXT_CREATE_OPTION: {
    name: 'createTextOption',
    type: 'input',
    message: 'Which would you like to name the text option?',
    when: () => isOptionNotPassed('createTextOption'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Text option name cannot be empty';
    },
  },
  TEXT_CREATE_OPTION_MENU: {
    name: 'createTextMenuOption',
    type: 'list',
    choices: ['Create a new text option', 'Delete a text option', 'Continue'],
    message: 'Which would you like to do now?',
    when: () => isOptionNotPassed('createTextMenuOption'),
  },
  TEXT_DELETE_OPTION: (choices: string[]) => ({
    name: 'deleteTextOption',
    type: 'list',
    choices,
    message: 'Which option would you like to delete?',
    when: () => isOptionNotPassed('deleteTextOption'),
  }),
  TEXT_OPTIONS_DEFAULT: (choices: string[]) => ({
    name: 'textOptionsDefault',
    type: 'list',
    choices,
    message: 'Which option should be the default?',
    when: () => isOptionNotPassed('textOptionsDefault'),
  }),
  PLAN_FEATURE_VALUE: ({
    planName,
    type,
    choices,
  }: {
    planName: string;
    type: string;
    choices?: string[];
  }) => ({
    name: 'planFeatureValue',
    type,
    ...(choices?.length && { choices }),
    message: `What value should be given to this feature for the existing plan ${planName}?`,
    when: () => isOptionNotPassed('planFeatureValue'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Feature value cannot be empty';
    },
  }),
  VISIBILITY: {
    name: 'visibility',
    type: 'list',
    choices: ['public', 'private'],
    message: 'What is the visbibility of the feature: ',
    when: () => isOptionNotPassed('visibility'),
  },
};

export const CREATE_API_KEY_QUESTIONS = [
  {
    name: 'name',
    type: 'input',
    message: 'What would you like to name the API Key: ',
    when: () => isOptionNotPassed('name'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'API Key name cannot be empty';
    },
  },
];

export const CREATE_APP_QUESTIONS = {
  TEMPLATE_NAME: (TEMPLATE_CHOICES: string[]) => ({
    name: 'template',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: TEMPLATE_CHOICES,
    when: () => isOptionNotPassed('template'),
  }),
  PROJECT_NAME: {
    name: 'name',
    type: 'input',
    message: 'Project name:',
    when: () => isOptionNotPassed('name'),
    validate: (input: string) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return 'Project name may only include letters, numbers, underscores and hashes.';
    },
  },
  API_KEY: (API_KEY_CHOICES: string[]) => ({
    name: 'apiKey',
    type: 'list',
    message: 'What api-key would you like to uset to generate the project?',
    choices: API_KEY_CHOICES,
    when: () => isOptionNotPassed('apiKey'),
  }),
};

export const DEPRECATE_API_KEY_QUESTIONS = [
  {
    name: 'value',
    type: 'input',
    message: 'API Key value to deprecate: ',
    when: () => isOptionNotPassed('value'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'API Key value cannot be empty';
    },
  },
];

export const DEPRECATE_PRODUCT_QUESTIONS = [
  {
    name: 'uuid',
    type: 'input',
    message: 'Product UUID to deprecate: ',
    when: () => isOptionNotPassed('uuid'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Product UUID cannot be empty';
    },
  },
];

export const DEPRECATE_CAPABILITY_QUESTIONS = [
  {
    name: 'uuid',
    type: 'input',
    message: 'Capability UUID to deprecate: ',
    when: () => isOptionNotPassed('uuid'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Capability UUID cannot be empty';
    },
  },
];

export const LIST_CAPABILITY_QUESTIONS = [
  {
    name: 'productUuid',
    type: 'input',
    message: 'Product UUID to show capabilities for: ',
    when: () => isOptionNotPassed('productUuid'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Product UUID cannot be empty';
    },
  },
];

export const LIST_PLANS_QUESTIONS = [
  {
    name: 'productUuid',
    type: 'input',
    message: 'Product UUID to show plans for: ',
    when: () => isOptionNotPassed('productUuid'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Product UUID cannot be empty';
    },
  },
];
