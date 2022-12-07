import { Argv } from 'yargs';
import { deprecateApiKey } from './api-key';
import { deprecateCapability } from './capability';
import { deprecateProduct } from './product';

export const deprecateCommands = (cli: Argv) => {
  const COMMAND_NAME = 'deprecate';
  const COMMAND_DESCRIPTION =
    'Deprecate an existing [product|api key] in your Salable Account';

  const builder = (yargs: Argv) => {
    return (
      yargs
        .usage('usage: $0 deprecate <item> [options]')
        // Deprecate Product
        .command({
          command: deprecateProduct.command,
          describe: deprecateProduct.describe,
          builder: deprecateProduct.builder,
          handler: deprecateProduct.handler,
        })
        // Deprecate API Key
        .command({
          command: deprecateApiKey.command,
          describe: deprecateApiKey.describe,
          builder: deprecateApiKey.builder,
          handler: deprecateApiKey.handler,
        })
        // Deprecate Capability
        .command({
          command: deprecateCapability.command,
          describe: deprecateCapability.describe,
          builder: deprecateCapability.builder,
          handler: deprecateCapability.handler,
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
