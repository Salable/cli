#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as commands from './commands';

(async () => {
  const cli = yargs(hideBin(process.argv))
    // Enable strict mode.
    .strict()
    // Useful aliases.
    .alias({ h: 'help' });

  // Loop over the comamnds from the commands directory and add a command for it
  Object.values(commands).map((command) =>
    cli.command({
      ...command,
    })
  );

  await cli.argv;
})().catch((e) => console.error(e));
