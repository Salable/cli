import { Arguments } from 'yargs';
import { getProperty, log, salableRcExists } from '../utils';

const checkPropertyExists = async (type: 'ACCESS_TOKEN') => {
  if (!(await getProperty(type))) {
    log.error(`ERROR: No ${type} found. Please run salable auth to authenticate.`).exit(1);
  }
};

const checkSalableRcExists = () => {
  // If `.salablerc` does not exist then exit the command
  if (!salableRcExists) {
    log
      .error('ERROR: No `.salablerc` file exits. Please run `salable auth` to authenticate first.')
      .exit(1);
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

  // Check if `ACCESS_TOKEN` does not exist
  await checkPropertyExists('ACCESS_TOKEN');
};
