import { Answers } from 'inquirer';
import yargs from 'yargs';

export const processAnswers = <T>(answers?: Answers) => {
  return Object.assign({}, answers, yargs(process.argv).argv) as T;
};
