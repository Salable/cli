import { CommandBuilder } from 'yargs';
import { ICommand } from '../../types';
import { getProperty, log, updateLineSalableRc } from '../../utils';
import ErrorResponse from '../../error-response';
import { getLDFlag } from '../../constants';

const builder: CommandBuilder = {};

const handler = async () => {
  try {
    const salableTestModeAllowed = await getLDFlag<boolean, boolean>({
      flag: 'salable-test-mode',
      defaultValue: false,
    });

    if (!salableTestModeAllowed) {
      throw new Error('Your current organisation does not have access to test mode.');
    }

    const currentMode = await getProperty('TEST_MODE');

    if (currentMode === 'true') {
      await updateLineSalableRc('TEST_MODE', 'false');

      log.success('Switched to live mode').exit(0);
    } else {
      await updateLineSalableRc('TEST_MODE', 'true');
      log.success('Switched to test mode').exit(0);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    if (e.message !== 'Caught in ora') {
      log.error(e.message).exit(1);
    }
  }
};

export const switchMode: ICommand = {
  command: 'mode',
  describe: 'Switch between live and test mode',
  builder,
  handler,
};
