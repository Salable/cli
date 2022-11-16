export interface IAuth0Tokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export interface ICommand {
  command: string;
  desc: string;
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
  method: 'POST' | 'PUT' | 'DEL';
  body?: {
    [key: string]:
      | string
      | boolean
      | number
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
  displayName: 'Bespoke Paid';
  status: 'ACTIVE';
  trialDays: null;
  evaluation: false;
  evalDays: 0;
  organisation: 'org_gsne690Ck2Q1ZUek';
  visibility: 'private';
  licenseType: 'customId';
  interval: 'day';
  length: 1;
  active: true;
  planType: 'Bespoke';
  pricingType: 'paid';
  environment: 'stg';
  type: 'custom';
  paddlePlanId: null;
  productUuid: '06cb124b-b1f3-4ce9-b309-846b1622ed6a';
  salablePlan: false;
  updatedAt: '2022-07-18T10:43:58.190Z';
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
