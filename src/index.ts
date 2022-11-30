#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  auth,
  createCommands,
  deprecateCommands,
  listCommands,
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

  // sub commands
  listCommands(cli);
  createCommands(cli);
  deprecateCommands(cli);

  await cli.wrap(null).argv;
})().catch((e) => {
  console.error(e);
});
