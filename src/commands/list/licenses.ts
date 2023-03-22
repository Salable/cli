import ErrorResponse from '../../error-response';
import { ICommand, ILicense, IListLicensesQuestionAnswers } from '../../types';
import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import { processAnswers } from '../../utils/process-answers';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  showCanceled: {
    type: 'boolean',
    description: 'Show canceled licenses as well as active ones',
  },
};

const handler = async () => {
  try {
    const { showCanceled } = await processAnswers<IListLicensesQuestionAnswers>();

    const response = await RequestBase<{
      count: 2;
      data: ILicense[];
    }>({
      method: 'GET',
      endpoint: `licenses`,
    });

    if (!response) {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`No licenses found`));
      return;
    }

    const { data: licenses } = response;

    if (showCanceled === 'true') {
      // eslint-disable-next-line no-console
      console.log(licenses);
      return;
    }

    const activeLicenses =
      Array.isArray(licenses) && licenses.filter(({ status }) => status !== 'CANCELED');

    if (Array.isArray(activeLicenses) && !activeLicenses?.length) {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`No licenses found`));
    } else {
      // eslint-disable-next-line no-console
      console.log(activeLicenses);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const listLicenses: ICommand = {
  command: 'licenses',
  describe: 'List all the licenses on your account',
  builder,
  handler,
};
