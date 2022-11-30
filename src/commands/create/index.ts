import { Argv } from 'yargs';
import { createProduct } from './product';
import { createApp } from './app';

export const createCommands = (cli: Argv) => {
  const COMMAND_NAME = 'create';
  const COMMAND_DESCRIPTION =
    'Create a new [product|api key|app] in your Salable Account';

  const builder = (yargs: Argv) => {
    return (
      yargs
        .usage('usage: $0 create <item> [options]')
        .command({
          command: createApp.command,
          describe: createApp.describe,
          builder: createApp.builder,
          handler: createApp.handler,
        })
        // create product
        .command({
          command: createProduct.command,
          describe: createProduct.describe,
          builder: createProduct.builder,
          handler: createProduct.handler,
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
