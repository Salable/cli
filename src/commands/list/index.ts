import { Argv, CommandBuilder } from 'yargs';
import { listApiKeys } from './api-keys';
import { listCapabilities } from './capabilities';
import { listFeatures } from './features';
import { listLicenses } from './licenses';
import { listPlans } from './plans';
import { listProducts } from './products';
import { listSubscriptions } from './subscriptions';

export const listCommands = (cli: Argv) => {
  const COMMAND_NAME = 'list';
  const COMMAND_DESCRIPTION =
    'List your existing [products|api keys|capabilities|plans|features|licenses] in your Salable Account';

  const builder: CommandBuilder = (yargs: Argv) => {
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
        // list features
        .command({
          command: listFeatures.command,
          describe: listFeatures.describe,
          builder: listFeatures.builder,
          handler: listFeatures.handler,
        })
        // list licenses
        .command({
          command: listLicenses.command,
          describe: listLicenses.describe,
          builder: listLicenses.builder,
          handler: listLicenses.handler,
        })
        // list subscriptions
        .command({
          command: listSubscriptions.command,
          describe: listSubscriptions.describe,
          builder: listSubscriptions.builder,
          handler: listSubscriptions.handler,
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
