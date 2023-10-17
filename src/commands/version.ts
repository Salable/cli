import { ICommand } from '../types';
import { CommandBuilder } from 'yargs';
import pjson from '../../package.json';
import { log } from '../utils';

const builder: CommandBuilder = {};

// eslint-disable-next-line @typescript-eslint/require-await
const handler = async () => {
  log.plain(pjson.version);
};

export const version: ICommand = {
  command: 'version',
  describe: "Retrieve the version of the Salable CLI you're currently using.",
  builder,
  handler,
};
