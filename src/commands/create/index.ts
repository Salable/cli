import { Argv } from 'yargs';
import { createProduct } from './product';
import { createApp } from './app';
import { createApiKey } from './api-key';

export const createCommands = (cli: Argv) => {
  const COMMAND_NAME = 'create';
  const COMMAND_DESCRIPTION =
    'Create a new [product|api key|app] in your Salable Account';

  const builder = (yargs: Argv) => {
    return (
      yargs
        .usage('usage: $0 create <item> [options]')
        // create example app
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
        // create api-key
        .command({
          command: createApiKey.command,
          describe: createApiKey.describe,
          builder: createApiKey.builder,
          handler: createApiKey.handler,
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
