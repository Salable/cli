import { User } from '@clerk/clerk-sdk-node';
import { CommandBuilder } from 'yargs';

export interface ICommand {
  command: string;
  describe: string;
  handler: () => Promise<void>;
  builder?: CommandBuilder;
}

type IGetRequest = {
  method: 'GET';
  body?: never;
};

export type IRequestBody = {
  [key: string]:
    | string
    | boolean
    | number
    | string[]
    | {
        [key: string]: string | boolean | { [key: string]: string | boolean };
      }
    | {
        [key: string]: string | boolean | undefined | { [key: string]: string | boolean };
      }[];
};

type IRequest<T> = {
  method: 'POST' | 'PUT' | 'DELETE';
  body?: T;
};

export type IRequestBase<T> = (IGetRequest | IRequest<T>) & {
  endpoint: string;
  command?: string;
  hideTestModeWarning?: boolean;
};

export type IStatus = 'ACTIVE' | 'DEPRECATED' | 'CANCELED';

export type IOrganisationPaymentIntegration = {
  uuid: string;
  organisation: string;
  integrationName: string;
  accountName: string;
  accountData: {
    publishableKey: string;
    secretKey: string;
  };
  updatedAt: string;
};

export type ICapability = {
  uuid: string;
  name: string;
  description: string | null;
  status: IStatus;
  productUuid: string;
  updatedAt: string;
};

export type ISubscription = {
  uuid: string;
  paymentIntegrationSubscriptionId: string;
  productUuid: string;
  type: string;
  email: string;
  organisation: string;
  status: 'ACTIVE' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
  expiryDate: string;
  licenseUuid: string;
  planUuid: string;
  plan: IPlan;
  product: IProduct;
};

export type ICurrency = {
  productUuid: string;
  currencyUuid: string;
  defaultCurrency: boolean;
};

export type IFeatureEnumOption = {
  uuid: string;
  name: string;
  featureUuid: string;
  updatedAt: string;
  safeDelete: boolean;
};

export type IFeature = {
  uuid: string;
  name: string;
  description: string;
  displayName: string;
  variableName: string;
  status: IStatus;
  visibility: string;
  valueType: string;
  defaultValue: string;
  showUnlimited: boolean;
  productUuid: string;
  updatedAt: string;
  featureEnumOptions: IFeatureEnumOption[];
};

export type IPlan = {
  uuid: string;
  name: string;
  description: null | string;
  displayName: string;
  status: IStatus;
  trialDays: null | number;
  evaluation: boolean;
  evalDays: number;
  organisation: string;
  visibility: string;
  licenseType: string;
  interval: string;
  length: number;
  active: boolean;
  planType: string;
  pricingType: string;
  environment: string;
  type: string;
  paddlePlanId: null | string;
  productUuid: string;
  salablePlan: boolean;
  updatedAt: string;
  capabilities: ICapability[];
  features: IFeature[];
  currencies: ICurrency[];
};

export type ILicense = {
  uuid: string;
  name: string | null;
  email: string;
  status: IStatus;
  granteeId: string;
  paymentService: string;
  purchaser: string;
  type: string;
  productUuid: string;
  planUuid: string;
  capabilities: ICapability[];
  metadata: null;
  startTime: string;
  endTime: string;
  updatedAt: string;
};

export type IProduct = {
  uuid: string;
  name: string;
  description: string;
  logoUrl: string | null;
  displayName: string;
  organisation: string;
  status: IStatus;
  paid: boolean;
  appType: 'Miro' | 'Trello' | 'Custom';
  organisationPaymentIntegrationUuid: string;
  paymentIntegrationProductId?: string;
  updatedAt: string;
  capabilities: ICapability[];
  features: IFeature[];
  organisationPaymentIntegration: IOrganisationPaymentIntegration | null;
  currencies: ICurrency[];
  plans: IPlan[];
  licenses: ILicense[];
};

export interface IAWSPresignedPostResponse {
  url: string;
  filePath: string;
  fields: {
    Policy: string;
    'X-Amz-Algorithm': string;
    'X-Amz-Credential': string;
    'X-Amz-Date': string;
    'X-Amz-Security-Token': string;
    'X-Amz-Signature': string;
    acl: string;
    bucket: string;
    key: string;
  };
}

export interface IApiKey {
  uuid: string;
  name: string;
  description: string | null;
  status: IStatus;
  value: string;
  scopes: string[];
  organisation: string;
  sub: string;
  awsId: string;
  updatedAt: string;
}

export interface IOrganisation {
  clerkOrgId: string;
  addressDetails: { [k: string]: string };
  metadata: { goals: string[] };
  svixAppId: string;
  logoUrl: null | string;
  salablePlanUuid: null | string;
  billingEmailId: string;
  updatedAt: string;
  name: string;
  slug: string;
}

export enum HttpStatusCodes {
  ok = 200,
  created = 201,
  noContent = 204,
  multipleChoices = 300,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  methodNotAllowed = 405,
}

export type IDecodedToken = {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  azp: string;
  scope: string;
  org_id: string;
  permissions: string[];
};

export interface TemplateData {
  projectName: string;
  apiKey: string;
}

// Question Answers
export interface ICreateProductQuestionAnswers {
  name: string;
  displayName: string;
  appType: 'Miro' | 'Trello' | 'Custom';
  productDescription: string;
}

export interface ICreateCapabilityQuestionAnswers {
  name: string;
  productName: string;
}

export interface ICreateFeatureQuestionAnswers {
  name: string;
  displayName: string;
  productName: string;
  variableName: string;
  description: string;
  valueType: 'true/false' | 'numerical' | 'text';
  trueFalseDefault: boolean;
  visibility: string;
  showUnlimited: boolean;
  unlimitedNumberDefault: 'Unlimited' | 'Number';
  numberDefault: number;
  createTextOption: string;
  createTextMenuOption: 'Create a new text option' | 'Delete a text option' | 'Continue';
  deleteTextOption: string;
  textOptionsDefault: string;
  planFeatureValue: string;
  planNumberDefault: number;
  planUnlimitedNumberDefault: 'Unlimited' | 'Number';
}

export interface ICreateLicenseQuestionAnswers {
  productName: string;
  planName: string;
  granteeId: string;
  licenseeEmail: string;
  endDate: string;
}

export interface IUpdateLicenseQuestionAnswers {
  licenseId: string;
  granteeId: string;
}

export interface ICreatePlanQuestionAnswers {
  name: string;
  displayName: string;
  productName: string;
  description: string;
  capabilities: string[];
  licenseType?: 'User' | 'Board';
  planType: 'Standard' | 'Bespoke' | 'Evaluation' | 'Coming Soon';
  published: boolean;
  visibility: string;
  planCycleInterval: 'Year' | 'Month';
  planIntervalLength: number;
  evaluationPeriod: boolean;
  evaluationPeriodDays: number;
}

export interface IUpdatePlanQuestionAnswers {
  name: string;
  displayName: string;
  productName: string;
  description: string;
  capabilities: string[];
  licenseType?: 'User' | 'Board';
  planType: 'Standard' | 'Bespoke' | 'Evaluation' | 'Coming Soon';
  published: boolean;
  visibility: string;
  planCycleInterval: 'Year' | 'Month';
  planIntervalLength: number;
  evaluationPeriod: boolean;
  evaluationPeriodDays: number;
}

export interface IUpdateFeatureQuestionAnswers {
  name: string;
  displayName: string;
  productName: string;
  variableName: string;
  description: string;
  valueType: 'true/false' | 'numerical' | 'text';
  trueFalseDefault: boolean;
  visibility: string;
  showUnlimited: boolean;
  unlimitedNumberDefault: 'Unlimited' | 'Number';
  numberDefault: number;
  createTextOption: string;
  createTextMenuOption: 'Create a new text option' | 'Delete a text option' | 'Continue';
  deleteTextOption: string;
  textOptionsDefault: string;
  planFeatureValue: string;
  planNumberDefault: number;
  planUnlimitedNumberDefault: 'Unlimited' | 'Number';
  updateTextMenuOption: string;
  updateTextOption: string;
}

export interface ICreateAppQuestionAnswers {
  name: string;
  template: string;
  apiKey: string;
}

export interface ICreateAppTemplateConfig {
  files?: string[];
  postMessage?: string;
}

export interface ICreateAppCliOptions {
  projectName: string;
  templateName: string;
  templatePath: string;
  tartgetPath: string;
  config: ICreateAppTemplateConfig;
}

export interface ICreateAppCreateDirectoryContents {
  templatePath: string;
  projectName: string;
  templateData: TemplateData;
  config: ICreateAppTemplateConfig;
}

export interface ICreateApiKeyQuestionAnswers {
  name: string;
}

export interface IDeprecateApiKeyQuestionAnswers {
  value: string;
}

export interface IDeprecateProductQuestionAnswers {
  uuid: string;
}

export interface IDeprecatePlanQuestionAnswers {
  uuid: string;
}

export interface IDeprecateCapabilityQuestionAnswers {
  uuid: string;
}

export interface ISwitchOrganisationQuestionAnswers {
  organisation: string;
}

export interface ISuspendLicenseQuestionAnswers {
  uuid: string;
}

export interface ISuspendSubscriptionQuestionAnswers {
  uuid: string;
  when: 'Now' | 'End of the current billing period';
}

export interface IListApiKeysQuestionAnswers {
  showDeprecated: string;
}

export interface IListProductsQuestionAnswers {
  showDeprecated: string;
}

export interface IListCapabilitiesQuestionAnswers {
  showDeprecated: string;
  productUuid: string;
}

export interface IListLicensesQuestionAnswers {
  showCanceled: string;
}

export interface IListSubscriptionsQuestionAnswers {
  showSuspended: string;
}

export interface IListPlansQuestionAnswers {
  showDeprecated: string;
  productUuid: string;
}

export interface IListFeaturesQuestionAnswers {
  showDeprecated: string;
  productUuid: string;
}

export interface IAuthQuestionAnswers {
  username: string;
  password: string;
}

export interface IConfigureQuestionAnswers {
  paymentIntegration: string;
}

export interface IJWTPayload {
  __client_uat: string;
  ajs_user_id: string;
  __session: string;
  __clerk_db_jwt: string;
  [key: string]: string;
}

export interface IUser extends User {
  email: string;
  permissions: string[];
}

export interface IApiKeyScopes {
  Admin: string[];
}
