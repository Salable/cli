#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as commands from './commands';
import commandBase from './utils/command-base';

(async () => {
  const cli = yargs(hideBin(process.argv))
    // Useful aliases.
    .alias({ h: 'help' });

  // Get the command executed by the user from the CLI arguments
  const {
    _: [executedCommand],
  } = await cli.argv;

  // Loop over the comamnds from the commands directory and add a command for it
  Object.values(commands).map(async ({ command, desc, handler }) =>
    cli.command({
      command,
      describe: desc,
      handler: await commandBase({ handler, command, executedCommand }),
    })
  );

  await cli.argv;
})().catch((e) => {
  console.error(e);
});
