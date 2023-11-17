import { URLSearchParams, parse } from 'url';
import http from 'node:http';
import open from 'open';
import { nanoid } from 'nanoid';
import { ICommand } from '../types';
import { CommandBuilder } from 'yargs';
import {
  RequestBase,
  createSalableRc,
  log,
  removeLineSalableRc,
  salableRcExists,
  updateLineSalableRc,
} from '../utils';
import ErrorResponse from '../error-response';
import ora from 'ora';
import { readFileSync } from 'fs';
import { isProd } from '../config';
import path from 'path';

const builder: CommandBuilder = {};

const handler: () => Promise<void> = async () =>
  new Promise(async (resolve) => {
    const spinner = ora('Performing Authentication With Salable');
    spinner.start();

    const state = nanoid();
    const basePath = isProd ? path.join(__dirname, './auth') : './src/auth';
    const htmlFile = readFileSync(`${basePath}/complete.html`);

    const url =
      process.env.OAUTH_AUTHORIZE_URL +
      '?' +
      new URLSearchParams({
        response_type: 'code',
        redirect_uri: 'http://localhost:9999/oauth/callback',
        client_id: process.env.OAUTH_CLIENT_ID || '',
        scope: 'profile email',
        state,
      }).toString();

    http
      .createServer(async (req, res) => {
        if (req.url?.includes('/oauth/callback')) {
          const { query } = parse(req.url, true);

          if (state !== query.state) {
            log.error('Failed to authorise safely. Please try again').exit(1);
          }

          try {
            const authData = await RequestBase<
              {
                token: string;
                organisationName: string;
              },
              {
                code: string;
              }
            >({
              method: 'POST',
              endpoint: `cli/auth`,
              body: {
                code: query.code as string,
              },
              command: auth.command,
            });

            if (!authData) {
              spinner.fail(log.error('Something went wrong, please try again...').exit(0));
              return;
            }

            const { token, organisationName } = authData;

            // 3. Either update or create the .salablerc file with the new data
            if (salableRcExists) {
              await updateLineSalableRc('ACCESS_TOKEN', token);
              await removeLineSalableRc('REFRESH_TOKEN');
              await removeLineSalableRc('ORGANISATION');
              await updateLineSalableRc('TEST_MODE', 'false');
            } else {
              createSalableRc(token, 'false');
            }

            res.end(htmlFile);

            spinner.succeed("You're now authenticated with Salable!");
            log.success(`Current Org: ${organisationName}`).exit(0);
          } catch (e) {
            if (!(e instanceof ErrorResponse)) return;

            spinner.fail(log.error(e.message).exit(1));
          }
        }

        // This is what tells yargs to stop running this command. It waits for
        // the promise to resolve...
        resolve();
      })
      .listen(9999);

    await open(url);
  });

export const auth: ICommand = {
  command: 'auth',
  describe: 'Authenticate with your Salable Organisation',
  builder,
  handler,
};
