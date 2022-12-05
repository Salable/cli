export interface IAuth0Tokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export interface ICommand {
  command: string;
  describe: string;
  handler: () => Promise<void>;
  builder?: {
    [key: string]: {
      [key: string]: string;
    };
  };
}

type IGetRequest = {
  method: 'GET';
  body?: never;
};

type IRequest = {
  method: 'POST' | 'PUT' | 'DELETE';
  body?: {
    [key: string]:
      | string
      | boolean
      | number
      | string[]
      | {
          [key: string]: string | boolean;
        }
      | {
          [key: string]: string | boolean;
        }[];
  };
};

export type IRequestBase = (IGetRequest | IRequest) & {
  endpoint: string;
};

export type IStatus = 'ACTIVE' | 'DEPRECATED';

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

export type ICurrency = {
  productUuid: string;
  currencyUuid: string;
  defaultCurrency: boolean;
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
};

export type IPlan = {
  uuid: string;
  name: string;
  description: null;
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
