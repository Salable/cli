import chalk from 'chalk';
import { ArgumentsCamelCase } from 'yargs';
import { getToken, salableRcExists } from './salable-rc-utils';

interface IProps {
  handler: (() => Promise<void>) | (() => Promise<void>);
  command: string;
  executedCommand: string | number;
}

type IReturnType = (args: ArgumentsCamelCase<unknown>) => void | Promise<void>;

async function checkTokenExists(type: 'ACCESS_TOKEN' | 'REFRESH_TOKEN') {
  if (!(await getToken(type))) {
    console.error(
      chalk.red(
        `ERROR: No ${type} found. Please run salable auth to authenticate.`
      )
    );
    process.exit(1);
  }
}

function checkSalableRcExists() {
  // If `.salablerc` does not exist then exit the command
  if (!salableRcExists) {
    console.error(
      chalk.red(
        'ERROR: No `.salablerc` file exits. Please run `salable auth` to authenticate first.'
      )
    );
    process.exit(1);
  }
}

/**
 * Function to wrap each command to allow for global checks prior to execution. E.g. is authenticated.
 **/
export default async function commandBase({
  handler,
  command,
  executedCommand,
}: IProps): Promise<IReturnType> {
  // If command isn't the executed one, return a reference to it and don't execute it.
  if (command !== executedCommand) {
    return handler;
  }

  // If the 'auth' command is executed then skip checks and perform auth
  if (command === executedCommand && executedCommand === 'auth') {
    return handler() as unknown as Promise<IReturnType>;
  }

  // Check if the `.salablerc` file exists
  checkSalableRcExists();

  // Check if either `ACCESS_TOKEN` or `REFRESH_TOKEN` does not exist
  await checkTokenExists('ACCESS_TOKEN');
  await checkTokenExists('REFRESH_TOKEN');

  return handler() as unknown as Promise<IReturnType>;
}
