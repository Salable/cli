import { Argv, CommandBuilder } from 'yargs';
import { suspendLicense } from './license';

export const suspendCommands = (cli: Argv) => {
  const COMMAND_NAME = 'suspend';
  const COMMAND_DESCRIPTION = 'Suspend an existing [license] in your Salable Account';

  const builder: CommandBuilder = (yargs: Argv) => {
    return (
      yargs
        .usage('usage: $0 suspend <item> [options]')
        // suspend license
        .command({
          command: suspendLicense.command,
          describe: suspendLicense.describe,
          builder: suspendLicense.builder,
          handler: suspendLicense.handler,
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
