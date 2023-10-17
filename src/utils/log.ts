/* eslint-disable no-console */

import { Chalk, green, red, yellow, white } from 'chalk';

/**
 * Factory function to create Log instances using the provided Chalk colours.
 * @param colour Colour of the function to be logged out using Chalk.
 * @returns Log instance using the provided Chalk colours
 */
function createLogMethod(colour: Chalk) {
  return <T>(message: string | T) => {
    if (colour === white) {
      console.log(message);
    } else {
      console.log(colour(message));
    }

    return {
      exit: (code = 0) => {
        return process.exit(code);
      },
    };
  };
}

/**
 * Logging utility function to help keep styles and erorrs consistent
 */
export const log = {
  success: createLogMethod(green),
  error: createLogMethod(red),
  warn: createLogMethod(yellow),
  plain: createLogMethod(white),
};
