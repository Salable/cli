import { Argv } from 'yargs';
import { listProducts } from './products';

export const listCommands = (cli: Argv) => {
  const COMMAND_NAME = 'list';
  const COMMAND_DESCRIPTION =
    'List your existing [products|api keys] in your Salable Account';

  const builder = (yargs: Argv) => {
    return yargs
      .usage('usage: $0 list <item> [options]')
      .command({
        command: listProducts.command,
        describe: listProducts.describe,
        builder: listProducts.builder,
        handler: listProducts.handler,
      })
      .wrap(null)
      .showHelpOnFail(true);
  };

  cli.command({
    command: COMMAND_NAME,
    describe: COMMAND_DESCRIPTION,
    builder,
    handler: () => undefined,
  });
};
