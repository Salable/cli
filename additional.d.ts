declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LAUNCHDARKLY_SDK_CLIENT_SIDE_ID: string;
      OAUTH_AUTHORIZE_URL: string;
      OAUTH_CLIENT_ID: string;
    }
  }
}

export {};
