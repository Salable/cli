declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LAUNCHDARKLY_SDK_CLIENT_SIDE_ID: string;
    }
  }
}

export {};
