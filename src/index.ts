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
import { getLDFlag } from './constants';

(async () => {
  const salableTestModeAllowed = await getLDFlag<boolean, boolean>({
    flag: 'salable-test-mode',
    defaultValue: false,
  });

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

  if (salableTestModeAllowed) {
    // switch mode command
    cli.command({
      command: switchMode.command,
      describe: switchMode.describe,
      builder: switchMode.builder,
      handler: switchMode.handler,
    });
  }

  // sub commands
  listCommands(cli);
  createCommands(cli);
  deprecateCommands(cli);
  updateCommands(cli);
  suspendCommands(cli);

  await cli.wrap(null).argv;
})()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
