import inquirer, { Answers, Question } from 'inquirer';
import yargs from 'yargs';

/**
 * Retrieve the user's answers from the questions.
 */
export const processAnswers = async <T>(questions?: Question[] | Question) => {
  if (!questions) {
    return Object.assign({}, yargs(process.argv).argv) as T;
  }

  const answers: Answers = await inquirer.prompt(questions);

  return Object.assign({}, answers, yargs(process.argv).argv) as T;
};
