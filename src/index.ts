#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  auth,
  createCommands,
  deprecateCommands,
  listCommands,
  suspendCommands,
  switchMode,
  updateCommands,
} from './commands';
import { validateAuth } from './middleware/validate-auth';

(async () => {
  const cli = yargs(hideBin(process.argv))
    // Useful aliases.
    .alias({ h: 'help' })
    .strict()
    .middleware(validateAuth);

  // auth command
  cli.command({
    command: auth.command,
    describe: auth.describe,
    builder: auth.builder,
    handler: auth.handler,
  });

  // switch mode command
  cli.command({
    command: switchMode.command,
    describe: switchMode.describe,
    builder: switchMode.builder,
    handler: switchMode.handler,
  });

  // sub commands
  listCommands(cli);
  createCommands(cli);
  deprecateCommands(cli);
  updateCommands(cli);
  suspendCommands(cli);

  await cli.wrap(null).argv;
})().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
});
