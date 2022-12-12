import { Argv } from 'yargs';
import { listApiKeys } from './api-keys';
import { listCapabilities } from './capabilities';
import { listPlans } from './plans';
import { listProducts } from './products';

export const listCommands = (cli: Argv) => {
  const COMMAND_NAME = 'list';
  const COMMAND_DESCRIPTION =
    'List your existing [products|api keys] in your Salable Account';

  const builder = (yargs: Argv) => {
    return (
      yargs
        .usage('usage: $0 list <item> [options]')
        // list products
        .command({
          command: listProducts.command,
          describe: listProducts.describe,
          builder: listProducts.builder,
          handler: listProducts.handler,
        })
        // list api-keys
        .command({
          command: listApiKeys.command,
          describe: listApiKeys.describe,
          builder: listApiKeys.builder,
          handler: listApiKeys.handler,
        })
        // list capabilities
        .command({
          command: listCapabilities.command,
          describe: listCapabilities.describe,
          builder: listCapabilities.builder,
          handler: listCapabilities.handler,
        })
        // list plans
        .command({
          command: listPlans.command,
          describe: listPlans.describe,
          builder: listPlans.builder,
          handler: listPlans.handler,
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
