import ErrorResponse from '../error-response';
import {
  createSalableRc,
  processAnswers,
  salableRcExists,
  updateLineSalableRc,
  removeLineSalableRc,
  RequestBase,
} from '../utils';
import chalk from 'chalk';
import { IAuthQuestionAnswers, ICommand } from '../types';
import { AUTH_QUESTIONS } from '../questions';
import { CommandBuilder } from 'yargs';
import ora from 'ora';

const builder: CommandBuilder = {
  organisation: {
    type: 'string',
    description: 'The Salable organisation name to authenticate with.',
    default: '',
  },
};

const handler = async () => {
  // 1. Get the name of the organisation from the user
  const { username, password } = await processAnswers<IAuthQuestionAnswers>(AUTH_QUESTIONS);

  const spinner = ora('Performing Authentication With Salable');
  spinner.start();

  try {
    const authData = await RequestBase<{
      token: string;
      organisationName: string;
    }>({
      method: 'POST',
      endpoint: `cli/auth`,
      body: {
        emailAddress: username,
        password,
      },
      command: auth.command,
    });

    if (!authData) {
      spinner.fail(chalk.red('Something went wrong, please try again...'));
      return;
    }

    const { token, organisationName } = authData;

    // 3. Either update or create the .salablerc file with the new data
    if (salableRcExists) {
      await updateLineSalableRc('ACCESS_TOKEN', token);
      await removeLineSalableRc('REFRESH_TOKEN');
      await removeLineSalableRc('ORGANISATION');
    } else {
      createSalableRc(token);
    }

    spinner.succeed("You're now authenticated with Salable!");
    // eslint-disable-next-line no-console
    console.log(`Current Org: ${organisationName}`);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    spinner.fail(chalk.red(e.message));
    process.exit(1);
  }

  process.exit(0);
};

export const auth: ICommand = {
  command: 'auth',
  describe: 'Authenticate with your Salable Organisation',
  builder,
  handler,
};
