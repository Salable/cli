import { Argv, CommandBuilder } from 'yargs';
import { updateFeature } from './feature';
import { updatePlan } from './plan';

export const updateCommands = (cli: Argv) => {
  const COMMAND_NAME = 'update';
  const COMMAND_DESCRIPTION =
    'Update an existing [feature|plan] in your Salable Account';

  const builder: CommandBuilder = (yargs: Argv) => {
    return (
      yargs
        .usage('usage: $0 update <item> [options]')
        // update feature
        .command({
          command: updateFeature.command,
          describe: updateFeature.describe,
          builder: updateFeature.builder,
          handler: updateFeature.handler,
        })
        // update plan
        .command({
          command: updatePlan.command,
          describe: updatePlan.describe,
          builder: updatePlan.builder,
          handler: updatePlan.handler,
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
