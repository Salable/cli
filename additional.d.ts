declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTH0_CLIENT_ID: string;
      AUTH0_DOMAIN: string;
      AUTH0_TOKEN_AUDIENCE: string;
      SALABLE_API_ENDPOINT: string;
    }
  }
}

export {};
