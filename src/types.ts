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
