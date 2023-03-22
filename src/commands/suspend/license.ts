import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import ErrorResponse from '../../error-response';
import { ICommand, ILicense, ISuspendLicenseQuestionAnswers } from '../../types';
import { SUSPEND_LICENSE_QUESTIONS } from '../../questions';
import { processAnswers } from '../../utils/process-answers';
import { CommandBuilder } from 'yargs';

const builder: CommandBuilder = {
  uuid: {
    type: 'string',
    description: 'The UUID of the license you want to suspend',
  },
};

const handler = async () => {
  try {
    const { uuid } = await processAnswers<ISuspendLicenseQuestionAnswers>(
      SUSPEND_LICENSE_QUESTIONS
    );

    await RequestBase<ILicense>({
      method: 'DELETE',
      endpoint: `licenses/${uuid}`,
    });

    // eslint-disable-next-line no-console
    console.log(chalk.green(`License: ${uuid} suspended succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const suspendLicense: ICommand = {
  command: 'license',
  describe: 'Suspend a license from a product',
  builder,
  handler,
};
