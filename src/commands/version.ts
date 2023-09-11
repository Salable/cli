import { ICommand } from '../types';
import { CommandBuilder } from 'yargs';
import pjson from '../../package.json';

const builder: CommandBuilder = {};

// eslint-disable-next-line @typescript-eslint/require-await
const handler = async () => {
  // eslint-disable-next-line no-console
  console.log(pjson.version);
};

export const version: ICommand = {
  command: 'version',
  describe: "Retrieve the version of the Salable CLI you're currently using.",
  builder,
  handler,
};
