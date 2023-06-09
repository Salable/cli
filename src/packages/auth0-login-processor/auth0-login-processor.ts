import { DataExtractor } from './types';
import {
  Deferred,
  encodeBase64,
  genRandom,
  genRandomString,
  isNonEmptyString,
  mkDeferred,
  sha256,
  startTimeout,
} from './utils';
import http from 'http';
import 'isomorphic-fetch';
import url from 'url';
import * as puppeteer from 'puppeteer';
import ErrorResponse from '../../error-response';
import ora from 'ora';
import chalk from 'chalk';

interface AuthResponse {
  code: string;
}

export interface Config {
  timeout: number;
  port: number;
  auth0Domain: string;
  auth0ClientId: string;
  auth0TokenScope: string;
  auth0TokenAudience: string;
  organisation: string;
  username: string;
  password: string;
}

const clickLogin = async function ({
  page,
}: {
  page: puppeteer.Page;
}): Promise<puppeteer.HTTPResponse> {
  await page.waitForSelector('button[type="submit"]', {
    visible: true,
    timeout: 5000,
  });
  const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.click('button[type="submit"]'),
  ]);

  if (response === null) {
    throw new Error('Response error');
  }

  return response;
};

const throwError = async (
  page: puppeteer.Page,
  spinner: ora.Ora,
  el: string,
  errMessage: string
) => {
  const regex = new RegExp(el, 'gi');
  const orgError = (await page.content()).match(regex);

  if (Array.isArray(orgError) && orgError?.length > 0) {
    spinner.fail(chalk.red(errMessage));
    throw new ErrorResponse(400, 'Caught in ora');
  }
};

/**
 * At the end of the authentication process, that did not time out, it might take a couple of seconds
 * for the NodeJS HTTP server to close.
 */
export class Auth0LoginProcessor<TToken> {
  private readonly server: http.Server = http.createServer(this.handleAuth0Response.bind(this));
  private csrfToken = '';
  private codeVerifier = '';
  private authResponse: Deferred<AuthResponse> = mkDeferred();

  constructor(public readonly config: Config, public readonly parseToken: DataExtractor<TToken>) {
    if (typeof config !== 'object') {
      throw new ErrorResponse(400, `Config is required.`);
    }
    if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
      throw new ErrorResponse(400, `Invalid port number in config.`);
    }
    if (typeof config.timeout !== 'number' || config.timeout < 0) {
      throw new ErrorResponse(400, `Invalid timeout value.`);
    }
    if (typeof config.auth0Domain !== 'string') {
      throw new ErrorResponse(400, `Invalid auth0Domain string.`);
    }
    if (typeof config.auth0ClientId !== 'string') {
      throw new ErrorResponse(400, `Invalid auth0ClientId string.`);
    }
    if (typeof config.auth0TokenScope !== 'string') {
      throw new ErrorResponse(400, `Invalid auth0TokenScope string.`);
    }
    if (typeof config.auth0TokenAudience !== 'string') {
      throw new ErrorResponse(400, `Invalid auth0TokenAudience string.`);
    }
    if (typeof config.organisation !== 'string') {
      throw new ErrorResponse(400, `No Organisation provided.`);
    }
    if (typeof config.username !== 'string') {
      throw new ErrorResponse(400, `No Salable Username provided.`);
    }
    if (typeof config.password !== 'string') {
      throw new ErrorResponse(400, `No Salable password provided.`);
    }
  }

  public async runLoginProcess(): Promise<TToken> {
    this.codeVerifier = encodeBase64(genRandom(32));
    this.csrfToken = genRandomString(16);
    this.authResponse = mkDeferred();

    await this.startServer();

    const codeChallenge = encodeBase64(sha256(Buffer.from(this.codeVerifier)));
    const authenticationUrl = this.getAuthenticationUrl(codeChallenge, this.csrfToken);

    const spinner = ora('Performing Authentication With Salable');

    try {
      spinner.start();

      const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();

      try {
        await page.goto(authenticationUrl);

        await page.waitForSelector('#organizationName', { visible: true });
        await page.type('#organizationName', this.config.organisation);

        await clickLogin({ page });

        await throwError(
          page,
          spinner,
          'The organization you entered is invalid',
          'Invalid organization name, please check it exists'
        );

        await Promise.allSettled([
          await page.waitForSelector('#password', { visible: true }),
          await page.waitForSelector('#username', { visible: true }),
        ]);

        await Promise.allSettled([
          await page.type('#username', this.config.username),
          await page.type('#password', this.config.password),
        ]);

        await new Promise((r) => setTimeout(r, 1000));

        await page.keyboard.press('Enter');
        await page.waitForNavigation();

        await throwError(
          page,
          spinner,
          'Wrong email or password',
          'Invalid username or password, please try again'
        );

        if (!page.url().includes('localhost')) {
          await page.waitForSelector('button[value="accept"]', {
            visible: true,
            timeout: 5000,
          });

          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('button[value="accept"]'),
          ]);
        }
      } finally {
        await page.close();
        await browser.close();
      }
    } catch (err) {
      if (!(err instanceof ErrorResponse)) {
        throw new ErrorResponse(400, 'Failed to open authentication URL.');
      }

      throw new ErrorResponse(err.statusCode, err.message);
    }

    const loginTimeout = startTimeout<AuthResponse>(this.config.timeout);

    const auth0Response = this.authResponse.promise.catch(() => {
      throw new ErrorResponse(400, `Authentication failed`);
    });

    const timeoutExpiration = loginTimeout.promise.catch(() => {
      throw new ErrorResponse(400, `Authentication process timed out.`);
    });

    try {
      const authResponse = await Promise.race([auth0Response, timeoutExpiration]);

      spinner.succeed("You're now authenticated with Salable!");
      return this.getToken(this.codeVerifier, authResponse.code);
    } finally {
      loginTimeout.cancel();
      await this.stopServer();
    }
  }

  private async getToken(codeVerifier: string, code: string): Promise<TToken> {
    const response = await fetch(`https://${this.config.auth0Domain}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.auth0ClientId,
        code_verifier: codeVerifier,
        code: code,
        redirect_uri: `http://localhost:${this.config.port}`,
      }),
    });

    if (response.status !== 200) {
      new ErrorResponse(400, 'Failed to get an access token.');
    }

    const data = (await response.json()) as unknown;
    const token = this.parseToken(data);
    return token;
  }

  private async startServer(): Promise<void> {
    if (this.server.listening) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.server.listen(this.config.port, (err?: Error) => {
        if (err) {
          return reject(
            new ErrorResponse(
              400,
              `Unable to start an HTTP server on port ${this.config.port}. See inner error for details.`
            )
          );
        }

        resolve();
      });
    });
  }

  private async stopServer(): Promise<void> {
    return new Promise((res, rej) => {
      if (!this.server.listening) {
        res();
        return;
      }

      try {
        this.server.close();
        res();
      } catch (err) {
        rej();
        throw new ErrorResponse(400, 'Failed to stop HTTP server.');
      }
    });
  }

  private handleAuth0Response(req: http.IncomingMessage, res: http.ServerResponse): void {
    const urlQuery = url.parse(req.url || '', true).query;
    const { code, state, error: message } = urlQuery;

    if (isNonEmptyString(code) && state === this.csrfToken) {
      this.authResponse.resolve({ code });
    } else {
      const formattedMessage = message === 'access_denied' ? 'Access Denied' : message;

      this.authResponse.reject({ message: formattedMessage });
    }

    res.end();
  }

  private getAuthenticationUrl(codeChallenge: string, state: string): string {
    return [
      `https://${this.config.auth0Domain}/authorize`,
      `?response_type=code`,
      `&code_challenge=${codeChallenge}`,
      `&code_challenge_method=S256`,
      `&client_id=${this.config.auth0ClientId}`,
      `&redirect_uri=http://localhost:${this.config.port}`,
      `&scope=${encodeURI(this.config.auth0TokenScope)}`,
      `&audience=${this.config.auth0TokenAudience}`,
      `&state=${state}`,
    ].join('');
  }
}
