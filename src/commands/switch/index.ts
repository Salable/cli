import { Argv, CommandBuilder } from 'yargs';
import { switchOrganisation } from './organisation';
import { switchMode } from './mode';

export const switchCommands = (cli: Argv) => {
  const COMMAND_NAME = 'switch';
  const COMMAND_DESCRIPTION = 'Switch your active [organisation] in your Salable Account';

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
          command: switchMode.command,
          describe: switchMode.describe,
          builder: switchMode.builder,
          handler: switchMode.handler,
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
