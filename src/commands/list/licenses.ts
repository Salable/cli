import ErrorResponse from '../../error-response';
import { ICommand, ILicense, IListLicensesQuestionAnswers } from '../../types';
import { RequestBase } from '../../utils/request-base';
import { processAnswers } from '../../utils/process-answers';
import { CommandBuilder } from 'yargs';
import { log } from '../../utils';

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
      count: number;
      data: ILicense[];
    }>({
      method: 'GET',
      endpoint: `licenses`,
    });

    if (!response) {
      log.warn(`No licenses found`).exit(0);
      return;
    }

    const { data: licenses } = response;
    if (showCanceled === 'true') {
      log.plain<ILicense[]>(licenses);
      return;
    }

    const activeLicenses = licenses.filter(({ status }) => status !== 'CANCELED');

    if (Array.isArray(activeLicenses) && !activeLicenses?.length) {
      log.warn(`No licenses found`).exit(0);
    } else {
      log.plain<ILicense[]>(activeLicenses);
    }
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const listLicenses: ICommand = {
  command: 'licenses',
  describe: 'List all the licenses on your account',
  builder,
  handler,
};
