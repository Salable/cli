import { CommandBuilder } from 'yargs';
import { ICommand } from '../types';
import { getProperty, updateSalableRc } from '../utils';
import ErrorResponse from '../error-response';
import chalk from 'chalk';

const builder: CommandBuilder = {};

const handler = async () => {
  try {
    const currentMode = await getProperty('TEST_MODE');

    if (currentMode === 'true') {
      await updateSalableRc('TEST_MODE', 'false');
      // eslint-disable-next-line no-console
      console.log(chalk.green('Switched to live mode'));
    } else {
      await updateSalableRc('TEST_MODE', 'true');
      // eslint-disable-next-line no-console
      console.log(chalk.green('Switched to test mode'));
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    if (e.message !== 'Caught in ora') {
      // eslint-disable-next-line no-console
      console.error(chalk.red(e.message));
    }

    process.exit(1);
  } finally {
    process.exit(0);
  }
};

export const switchMode: ICommand = {
  command: 'switch-mode',
  describe: 'Switch between live and test mode',
  builder,
  handler,
};
