import { RequestBase } from '../../utils/request-base';
import ErrorResponse from '../../error-response';
import { ICommand, ILicense, ISuspendLicenseQuestionAnswers } from '../../types';
import { SUSPEND_LICENSE_QUESTIONS } from '../../questions';
import { processAnswers } from '../../utils/process-answers';
import { CommandBuilder } from 'yargs';
import { log } from '../../utils';

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

    log.success(`License: ${uuid} suspended succesfully`);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const suspendLicense: ICommand = {
  command: 'license',
  describe: 'Suspend a license from a product',
  builder,
  handler,
};
