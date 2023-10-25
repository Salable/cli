#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  auth,
  configure,
  createCommands,
  deprecateCommands,
  listCommands,
  suspendCommands,
  switchCommands,
  updateCommands,
} from './commands';
import { validateAuth } from './middleware/validate-auth';
import { version } from './commands/version';
import { log } from './utils';

(async () => {
  const cli = yargs(hideBin(process.argv))
    // Useful aliases.
    .version(false)
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

  // configure command
  cli.command({
    command: configure.command,
    describe: configure.describe,
    builder: configure.builder,
    handler: configure.handler,
  });

  // version command
  cli.command({
    command: version.command,
    describe: version.describe,
    builder: version.builder,
    handler: version.handler,
  });

  // sub commands
  listCommands(cli);
  createCommands(cli);
  deprecateCommands(cli);
  updateCommands(cli);
  suspendCommands(cli);
  switchCommands(cli);

  await cli.wrap(null).argv;
})()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    log.error(e as string).exit(1);
  });
