import { Argv, CommandBuilder } from 'yargs';
import { switchOrganisation } from './organisation';
import { getLDFlag } from '../../constants';
import { switchMode } from '../switch-mode';

export const switchCommands = async (cli: Argv) => {
  const COMMAND_NAME = 'switch';
  const COMMAND_DESCRIPTION = 'Switch your active [organisation] in your Salable Account';

  const salableTestModeAllowed = await getLDFlag<boolean, boolean>({
    flag: 'salable-test-mode',
    defaultValue: false,
  });

  const builder: CommandBuilder = (yargs: Argv) => {
    return (
      yargs
        .usage('usage: $0 switch <item> [options]')
        // switch organisation
        .command({
          command: switchOrganisation.command,
          describe: switchOrganisation.describe,
          builder: switchOrganisation.builder,
          handler: switchOrganisation.handler,
        })
        .command({
          command: salableTestModeAllowed ? switchMode.command : undefined,
          describe: salableTestModeAllowed ? switchMode.describe : undefined,
          builder: salableTestModeAllowed ? switchMode.builder : undefined,
          handler: salableTestModeAllowed ? switchMode.handler : () => undefined,
        })
        .wrap(null)
        .showHelpOnFail(true)
    );
  };

  cli.command({
    command: COMMAND_NAME,
    describe: COMMAND_DESCRIPTION,
    builder,
    handler: () => undefined,
  });
};
