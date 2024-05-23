import { Answers } from 'inquirer';
import yargs from 'yargs';
import { IFeature, IPlan } from './types';

const isOptionNotPassed = (option: string) =>
  !Object.keys(yargs(process.argv).argv).includes(option);

export const CREATE_PRODUCT_QUESTIONS = [
  {
    name: 'displayName',
    type: 'input',
    message: 'What would you like to name your product?',
    when: () => isOptionNotPassed('displayName'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Project display name cannot be empty';
    },
  },
  {
    name: 'appType',
    type: 'list',
    choices: ['Trello', 'Miro', 'Custom'],
    message: 'What is the app type of the plan? ',
    when: () => isOptionNotPassed('appType'),
  },
  {
    name: 'productDescription',
    type: 'input',
    message: 'Description of your product: ',
    when: () => isOptionNotPassed('productDescription'),
  },
];

export const CREATE_LICENSE_QUESTIONS = {
  PRODUCT_NAME: (PRODUCT_NAME_CHOICES: string[]) => ({
    name: 'productName',
    type: 'list',
    message: 'What product would you like to create the license on: ',
    choices: PRODUCT_NAME_CHOICES,
    when: () => isOptionNotPassed('productName'),
  }),
  PLAN_NAME: (PLAN_NAME_CHOICES: string[]) => ({
    name: 'planName',
    type: 'list',
    message: 'What plan would you like to create the license on: ',
    choices: PLAN_NAME_CHOICES,
    when: () => isOptionNotPassed('planName'),
  }),
  GRANTEE_ID: {
    name: 'granteeId',
    type: 'input',
    message: 'What is the grantee ID of the license: ',
    when: () => isOptionNotPassed('granteeId'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'grantee id cannot be empty';
    },
  },
  LICENSEE_EMAIL: {
    name: 'licenseeEmail',
    type: 'input',
    message: 'What is the email address of the licensee: ',
    when: () => isOptionNotPassed('licenseeEmail'),
    validate: (input: string) => {
      const isEmail =
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(
          input
        );

      if (!input.length) {
        return 'licensee email cannot be empty';
      }

      if (!isEmail) {
        return 'licensee email must be a valid email address';
      }

      return true;
    },
  },
  END_DATE: {
    name: 'endDate',
    type: 'input',
    message: 'What is the end date of the license: ',
    default: () => {
      const date = new Date();

      date.setMonth(date.getMonth() + 1);

      return date.toISOString().split('T')[0];
    },
    when: () => isOptionNotPassed('endDate'),
    validate: (input: string) => {
      if (!input?.length) {
        return 'The end date cannot be empty';
      }

      if (isNaN(Date.parse(input))) {
        return 'End date must be a valid date. E.g. 2023-01-31';
      }

      return true;
    },
  },
};

export const UPDATE_LICENSE_QUESTIONS = {
  LICENSE_ID: {
    name: 'licenseId',
    type: 'input',
    message: 'What is the license ID to update: ',
    when: () => isOptionNotPassed('licenseId'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'license id cannot be empty';
    },
  },
  GRANTEE_ID: (prevValue: string) => ({
    name: 'granteeId',
    type: 'input',
    message: 'What is the new grantee ID of the license: ',
    when: () => isOptionNotPassed('granteeId'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'grantee id cannot be empty';
    },
    default: prevValue,
  }),
};

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
    when: () => isOptionNotPassed('trueFalseDefault') && valueType === 'true/false',
  }),
  NUMERICAL_SHOW_UNLIMITED: (prevValue?: boolean) => ({
    name: 'showUnlimited',
    type: 'confirm',
    message: 'Should an unlimited option be added? ',
    when: () => isOptionNotPassed('showUnlimited'),
    ...(prevValue !== undefined && { default: prevValue }),
  }),
  NUMERICAL_UNLIMITED_NUMBER_DEFAULT: (prevValue?: string) => ({
    name: 'unlimitedNumberDefault',
    type: 'list',
    choices: ['Unlimited', 'Number'],
    message: 'Which field is the deafult option? ',
    when: (answers: Answers) =>
      isOptionNotPassed('unlimitedNumberDefault') && (answers.showUnlimited as boolean),
    ...(prevValue !== undefined && { default: prevValue }),
  }),
  NUMERICAL_NUMBER_DEFAULT: (prevValue?: number) => ({
    name: 'numberDefault',
    type: 'input',
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
    ...(prevValue !== undefined && { default: prevValue }),
  }),
  PLAN_NUMERICAL_UNLIMITED_NUMBER_DEFAULT: (answers: Answers, planName: string) => ({
    name: 'planUnlimitedNumberDefault',
    type: 'list',
    choices: ['Unlimited', 'Number'],
    message: `Which field is the deafult option for plan: ${planName}?`,
    when: () =>
      isOptionNotPassed('planUnlimitedNumberDefault') && (answers.showUnlimited as boolean),
  }),
  PLAN_NUMERICAL_NUMBER_DEFAULT: (planAnswers: Answers, planName: string) => ({
    name: 'planNumberDefault',
    type: 'number',
    message: `Which number should be the default for the plan: ${planName}?`,
    when: (answers: Answers) => {
      return (
        isOptionNotPassed('planNumberDefault') &&
        (!planAnswers.showUnlimited || answers.planUnlimitedNumberDefault === 'Number')
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

export const CREATE_PLAN_QUESTIONS = {
  PRODUCT_NAME: (PRODUCT_NAME_CHOICES: string[]) => ({
    name: 'productName',
    type: 'list',
    message: 'What product would you like to create the plan on: ',
    choices: PRODUCT_NAME_CHOICES,
    when: () => isOptionNotPassed('productName'),
  }),
  DISPLAY_NAME: {
    name: 'displayName',
    type: 'input',
    message: 'What is the display name of the plan: ',
    when: () => isOptionNotPassed('displayName'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Plan display name cannot be empty';
    },
  },
  DESCRIPTION: {
    name: 'description',
    type: 'input',
    message: 'What is the description of the plan: ',
    when: () => isOptionNotPassed('description'),
  },
  CAPABILITIES: (choices: string[]) => ({
    name: 'capabilities',
    type: 'checkbox',
    message: 'What capabilities are on this plan? ',
    when: () => isOptionNotPassed('capabilities'),
    choices,
    validate: (input: string[]) => {
      if (input?.length) return true;
      else return 'At least one capability must be selected';
    },
  }),
  LICENSE_TYPE: (appType: 'Miro' | 'Trello' | 'Custom') => ({
    name: 'licenseType',
    type: 'list',
    choices: ['Licensed'],
    message: 'What is the license type of the plan? ',
    when: () => isOptionNotPassed('licenseType') && appType !== 'Custom',
  }),
  PLAN_TYPE: {
    name: 'planType',
    type: 'list',
    choices: ['Standard', 'Bespoke', 'Coming Soon'],
    message: 'What is the plan type? ',
    when: () => isOptionNotPassed('planType'),
  },
  PLAN_CYCLE_INTERVAL: (planAnswers: Answers) => ({
    name: 'planCycleInterval',
    type: 'list',
    choices: planAnswers?.planType === 'Bespoke' ? ['Year', 'Month', 'Day'] : ['Year', 'Month'],
    message: 'What is the plan cycle interval? ',
    when: () => isOptionNotPassed('planCycleInterval'),
  }),
  PLAN_INTERVAL_LENGTH: () => ({
    name: 'planIntervalLength',
    type: 'number',
    message: 'What is the plan interval length? ',
    when: () => isOptionNotPassed('planIntervalLength'),
    validate: (input: number) => {
      if (!isNaN(input)) return true;
      else return 'A numerical value is required';
    },
  }),
  EVALUATION_PERIOD: (planAnswers: Answers) => ({
    name: 'evaluationPeriod',
    type: 'confirm',
    message: 'Does this plan have an evaluation period? ',
    when: () =>
      isOptionNotPassed('evaluationPeriod') &&
      !['Coming Soon'].includes(planAnswers?.planType as string),
  }),
  EVALUATION_PERIOD_DAYS: (planAnswers: Answers) => ({
    name: 'evaluationPeriodDays',
    type: 'number',
    message: 'How many days is the evaluation period? ',
    when: (answers: Answers) =>
      isOptionNotPassed('evaluationPeriodDays') &&
      !['Coming Soon'].includes(planAnswers?.planType as string) &&
      (answers.evaluationPeriod as boolean),
    validate: (input: number) => {
      if (!isNaN(input)) return true;
      else return 'A numerical value is required';
    },
  }),
  VISIBILITY: {
    name: 'visibility',
    type: 'list',
    choices: ['public', 'private'],
    message: 'What is the visbibility of the plan: ',
    when: (answers: Answers) =>
      isOptionNotPassed('visibility') &&
      ['Standard', 'Coming Soon'].includes(answers?.planType as string),
  },
  PUBLISHED: {
    name: 'published',
    type: 'confirm',
    message: 'Is the plan published?',
    when: () => isOptionNotPassed('published'),
  },
  TRUE_FALSE_DEFAULT: (valueType: string, prevValue: string, featureName: string) => ({
    name: 'trueFalseDefault',
    type: 'list',
    choices: ['true', 'false'],
    message: `What is the default value for ${featureName}: `,
    when: () => isOptionNotPassed('trueFalseDefault') && valueType === 'boolean',
    default: prevValue,
  }),
  NUMERICAL_SHOW_UNLIMITED: (prevValue: boolean, featureName: string) => ({
    name: 'showUnlimited',
    type: 'confirm',
    message: `Add an unlimited option to the feature ${featureName}?`,
    when: () => isOptionNotPassed('showUnlimited'),
    ...(prevValue !== undefined && { default: prevValue }),
  }),
  NUMERICAL_UNLIMITED_NUMBER_DEFAULT: (prevValue: string, featureName: string) => ({
    name: 'unlimitedNumberDefault',
    type: 'list',
    choices: ['Unlimited', 'Number'],
    message: `Which field is the deafult option for the feature ${featureName}`,
    when: (answers: Answers) =>
      isOptionNotPassed('unlimitedNumberDefault') && (answers.showUnlimited as boolean),
    ...(prevValue !== undefined && { default: prevValue }),
  }),
  NUMERICAL_NUMBER_DEFAULT: (prevValue: number, featureName: string) => ({
    name: 'numberDefault',
    type: 'input',
    message: `Which number should be the default for the feature ${featureName}?`,
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
    ...(prevValue !== undefined && { default: prevValue }),
  }),
  TEXT_OPTIONS_DEFAULT: (choices: string[], featureName: string) => ({
    name: 'textOptionsDefault',
    type: 'list',
    choices,
    message: `Which option should be the default for the feature ${featureName}?`,
    when: () => isOptionNotPassed('textOptionsDefault'),
  }),
};

export const UPDATE_PLAN_QUESTIONS = {
  PRODUCT_NAME: (PRODUCT_NAME_CHOICES: string[]) => ({
    name: 'productName',
    type: 'list',
    message: 'What product would you like to update the plan on: ',
    choices: PRODUCT_NAME_CHOICES,
    when: () => isOptionNotPassed('productName'),
  }),
  PLAN_NAME: (PLAN_NAME_CHOICES?: IPlan[]) => ({
    name: 'planName',
    type: 'list',
    message: 'What plan would you like to update? ',
    choices: PLAN_NAME_CHOICES,
    when: () => isOptionNotPassed('planName'),
  }),
  DISPLAY_NAME: (prevValue: string) => ({
    name: 'displayName',
    type: 'input',
    message: 'What is the display name of the plan: ',
    when: () => isOptionNotPassed('displayName'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Plan display name cannot be empty';
    },
    default: prevValue,
  }),
  DESCRIPTION: (prevValue: string) => ({
    name: 'description',
    type: 'input',
    message: 'What is the description of the plan: ',
    when: () => isOptionNotPassed('description'),
    default: prevValue,
  }),
  LICENSE_TYPE: (appType: 'Miro' | 'Trello' | 'Custom') => ({
    name: 'licenseType',
    type: 'list',
    choices: ['Licensed'],
    message: 'What is the license type of the plan? ',
    when: () => isOptionNotPassed('licenseType') && appType !== 'Custom',
  }),
  PLAN_TYPE: {
    name: 'planType',
    type: 'list',
    choices: ['Standard', 'Bespoke', 'Coming Soon'],
    message: 'What is the plan type? ',
    when: () => isOptionNotPassed('planType'),
  },
  PLAN_CYCLE_INTERVAL: (planAnswers: Answers) => ({
    name: 'planCycleInterval',
    type: 'list',
    choices: planAnswers?.planType === 'Bespoke' ? ['Year', 'Month', 'Day'] : ['Year', 'Month'],
    message: 'What is the plan cycle interval? ',
    when: () => isOptionNotPassed('planCycleInterval'),
  }),
  PLAN_INTERVAL_LENGTH: () => ({
    name: 'planIntervalLength',
    type: 'number',
    message: 'What is the plan interval length? ',
    when: () => isOptionNotPassed('planIntervalLength'),
    validate: (input: number) => {
      if (!isNaN(input)) return true;
      else return 'A numerical value is required';
    },
  }),
  EVALUATION_PERIOD: (planAnswers: Answers) => ({
    name: 'evaluationPeriod',
    type: 'confirm',
    message: 'Does this plan have an evaluation period? ',
    when: () =>
      isOptionNotPassed('evaluationPeriod') &&
      !['Coming Soon'].includes(planAnswers?.planType as string),
  }),
  EVALUATION_PERIOD_DAYS: (planAnswers: Answers) => ({
    name: 'evaluationPeriodDays',
    type: 'number',
    message: 'How many days is the evaluation period? ',
    when: (answers: Answers) =>
      isOptionNotPassed('evaluationPeriodDays') &&
      !['Coming Soon'].includes(planAnswers?.planType as string) &&
      (answers.evaluationPeriod as boolean),
    validate: (input: number) => {
      if (!isNaN(input)) return true;
      else return 'A numerical value is required';
    },
  }),
  VISIBILITY: (prevValue: string) => ({
    name: 'visibility',
    type: 'list',
    choices: ['public', 'private'],
    message: 'What is the visbibility of the plan: ',
    when: (answers: Answers) =>
      isOptionNotPassed('visibility') &&
      ['Standard', 'Coming Soon'].includes(answers?.planType as string),
    default: prevValue,
  }),
  PUBLISHED: (prevValue: boolean) => ({
    name: 'published',
    type: 'confirm',
    message: 'Is the plan published?',
    when: () => isOptionNotPassed('published'),
    default: prevValue,
  }),
  TRUE_FALSE_DEFAULT: (valueType: string, prevValue: string, featureName: string) => ({
    name: 'trueFalseDefault',
    type: 'list',
    choices: ['true', 'false'],
    message: `What is the default value for ${featureName}: `,
    when: () => isOptionNotPassed('trueFalseDefault') && valueType === 'boolean',
    default: prevValue,
  }),
  NUMERICAL_SHOW_UNLIMITED: (prevValue: boolean, featureName: string) => ({
    name: 'showUnlimited',
    type: 'confirm',
    message: `Add an unlimited option to the feature ${featureName}?`,
    when: () => isOptionNotPassed('showUnlimited'),
    ...(prevValue !== undefined && { default: prevValue }),
  }),
  NUMERICAL_UNLIMITED_NUMBER_DEFAULT: (prevValue: string, featureName: string) => ({
    name: 'unlimitedNumberDefault',
    type: 'list',
    choices: ['Unlimited', 'Number'],
    message: `Which field is the deafult option for the feature ${featureName}`,
    when: (answers: Answers) =>
      isOptionNotPassed('unlimitedNumberDefault') && (answers.showUnlimited as boolean),
    ...(prevValue !== undefined && { default: prevValue }),
  }),
  NUMERICAL_NUMBER_DEFAULT: (prevValue: number, featureName: string) => ({
    name: 'numberDefault',
    type: 'input',
    message: `Which number should be the default for the feature ${featureName}?`,
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
    ...(prevValue !== undefined && { default: prevValue }),
  }),
  TEXT_OPTIONS_DEFAULT: (choices: string[], featureName: string) => ({
    name: 'textOptionsDefault',
    type: 'list',
    choices,
    message: `Which option should be the default for the feature ${featureName}?`,
    when: () => isOptionNotPassed('textOptionsDefault'),
  }),
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
      else return 'Project name may only include letters, numbers, underscores and hashes.';
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

export const DEPRECATE_PLAN_QUESTIONS = [
  {
    name: 'uuid',
    type: 'input',
    message: 'Plan UUID to deprecate: ',
    when: () => isOptionNotPassed('uuid'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Plan UUID cannot be empty';
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

export const SWITCH_ORGANISATION_QUESTIONS = {
  ORGANISATION: (orgNames: string[]) => ({
    name: 'organisation',
    type: 'list',
    message: 'Which organistion would you like to switch to: ',
    choices: orgNames,
  }),
};

export const SUSPEND_LICENSE_QUESTIONS = [
  {
    name: 'uuid',
    type: 'input',
    message: 'License UUID to suspend: ',
    when: () => isOptionNotPassed('uuid'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'License UUID cannot be empty';
    },
  },
];

export const SUSPEND_SUBSCRIPTION_QUESTIONS = [
  {
    name: 'uuid',
    type: 'input',
    message: 'Subscription UUID to suspend: ',
    when: () => isOptionNotPassed('uuid'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Subscription UUID cannot be empty';
    },
  },
  {
    name: 'when',
    type: 'list',
    choices: ['Now', 'End of the current billing period'],
    message: 'When would you like to suspend the subscription? ',
    when: () => isOptionNotPassed('when'),
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

export const LIST_FEATURES_QUESTIONS = [
  {
    name: 'productUuid',
    type: 'input',
    message: 'Product UUID to show features for: ',
    when: () => isOptionNotPassed('productUuid'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Product UUID cannot be empty';
    },
  },
];

export const UPDATE_FEATURE_QUESTIONS = {
  PRODUCT_NAME: (PRODUCT_NAME_CHOICES: string[]) => ({
    name: 'productName',
    type: 'list',
    message: 'What product would you like to update a feature on: ',
    choices: PRODUCT_NAME_CHOICES,
    when: () => isOptionNotPassed('productName'),
  }),
  FEATURE_NAME: (FEATURE_NAME_CHOICES?: IFeature[]) => ({
    name: 'featureName',
    type: 'list',
    message: 'What feature would you like to update? ',
    choices: FEATURE_NAME_CHOICES,
    when: () => isOptionNotPassed('name'),
  }),
  NAME: (prevValue: string) => ({
    name: 'name',
    type: 'input',
    message: 'What would you like to name the feature? ',
    when: () => isOptionNotPassed('name'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Feature name cannot be empty';
    },
    default: prevValue,
  }),
  DISPLAY_NAME: (prevValue: string) => ({
    name: 'displayName',
    type: 'input',
    message: 'What is the display name of the feature: ',
    when: () => isOptionNotPassed('displayName'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Feature display name cannot be empty';
    },
    default: prevValue,
  }),
  DESCRIPTION: (prevValue: string) => ({
    name: 'description',
    type: 'input',
    message: 'What is the new description of the feature: ',
    when: () => isOptionNotPassed('description'),
    default: prevValue,
  }),
  VISIBILITY: (prevValue: string) => ({
    name: 'visibility',
    type: 'list',
    choices: ['public', 'private'],
    message: 'What is the visbibility of the feature: ',
    when: () => isOptionNotPassed('visibility'),
    default: prevValue,
  }),
  TRUE_FALSE_DEFAULT: (valueType: string, prevValue: string) => ({
    name: 'trueFalseDefault',
    type: 'list',
    choices: ['true', 'false'],
    message: 'What is the default value: ',
    when: () => isOptionNotPassed('trueFalseDefault') && valueType === 'boolean',
    default: prevValue,
  }),
  TEXT_UPDATE_OPTIONS: (prevValues: string[]) => ({
    name: 'updateTextMenuOption',
    type: 'list',
    choices: [...prevValues, 'Continue'],
    message: 'Select a text option to update or press "Continue".',
    when: () => isOptionNotPassed('updateTextMenuOption'),
  }),
  TEXT_UPDATE: (prevValue: string) => ({
    name: 'updateTextOption',
    type: 'input',
    message: 'What would you like to rename the option to?',
    when: () => isOptionNotPassed('updateTextMenuOption'),
    default: prevValue,
  }),
};

export const AUTH_QUESTIONS = [
  {
    name: 'username',
    type: 'input',
    message: 'What is your Salable username (email address)? ',
    when: () => isOptionNotPassed('username'),
    validate: (input: string) => {
      const isEmail =
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(
          input
        );

      if (!input.length) {
        return 'Username cannot be empty';
      }

      if (!isEmail) {
        return 'Username be a valid email address';
      }

      return true;
    },
  },
  {
    name: 'password',
    type: 'password',
    message: 'What is your Salable password? ',
    when: () => isOptionNotPassed('password'),
    validate: (input: string) => {
      if (input?.length) return true;
      else return 'Password name cannot be empty';
    },
  },
];

export const CONFIGURE_QUESTIONS = {
  PAYMENT_INTEGRATION: (choices: string[]) => ({
    name: 'paymentIntegration',
    type: 'list',
    message: 'What payment integration would you like to use? ',
    choices,
  }),
};
