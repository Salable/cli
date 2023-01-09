import chalk from 'chalk';
import { Arguments } from 'yargs';
import { getToken, salableRcExists } from '../utils';

const checkTokenExists = async (type: 'ACCESS_TOKEN' | 'REFRESH_TOKEN') => {
  if (!(await getToken(type))) {
    console.error(
      chalk.red(
        `ERROR: No ${type} found. Please run salable auth to authenticate.`
      )
    );
    process.exit(1);
  }
};

const checkSalableRcExists = () => {
  // If `.salablerc` does not exist then exit the command
  if (!salableRcExists) {
    console.error(
      chalk.red(
        'ERROR: No `.salablerc` file exits. Please run `salable auth` to authenticate first.'
      )
    );
    process.exit(1);
  }
};

/**
 * Middleware function to run before each command to check if the user is auth'd
 **/
export const validateAuth = async (argv: Arguments) => {
  const {
    _: [executedCommand],
  } = argv;

  // If executedCommand is the 'auth' command, skip the token checks
  if (executedCommand === 'auth') {
    return;
  }

  // Check if the `.salablerc` file exists
  checkSalableRcExists();

  // Check if either `ACCESS_TOKEN` or `REFRESH_TOKEN` does not exist
  await checkTokenExists('ACCESS_TOKEN');
  await checkTokenExists('REFRESH_TOKEN');
};
