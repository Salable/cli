import { CommandBuilder } from 'yargs';
import ErrorResponse from '../../error-response';
import { UPDATE_LICENSE_QUESTIONS } from '../../questions';
import { ICommand, ILicense, IUpdateLicenseQuestionAnswers } from '../../types';
import { processAnswers } from '../../utils/process-answers';
import { RequestBase } from '../../utils/request-base';
import { log } from '../../utils';

const builder: CommandBuilder = {
  licenseId: {
    type: 'string',
    description: 'The license id to update',
    default: '',
  },
  granteeId: {
    type: 'string',
    description: 'The new grantee id for the license',
    default: '',
  },
};

const handler = async () => {
  try {
    // 1. Prompt the user for the license uuid they want to update
    const { licenseId } = await processAnswers<IUpdateLicenseQuestionAnswers>([
      UPDATE_LICENSE_QUESTIONS.LICENSE_ID,
    ]);

    const allLicenses = await RequestBase<{
      count: 2;
      data: ILicense[];
    }>({
      method: 'GET',
      endpoint: `licenses`,
    });

    const licenseToUpdate = allLicenses?.data.find((license) => license.uuid === licenseId);

    // 1a. If no license can be found for the given uuid, show an error and exit
    if (!licenseToUpdate) {
      throw new Error('Cannot find that license, exiting...');
    }

    // 2. Prompt the user for the new licence info
    const { granteeId } = await processAnswers<IUpdateLicenseQuestionAnswers>([
      UPDATE_LICENSE_QUESTIONS.GRANTEE_ID(licenseToUpdate.granteeId),
    ]);

    // 3. Perform PUT request to update the license
    await RequestBase<ILicense, { granteeId: string }>({
      method: 'PUT',
      endpoint: `licenses/${licenseToUpdate.uuid}`,
      body: {
        granteeId,
      },
    });

    log.success(`License ${licenseToUpdate?.name || ''} was updated succesfully`).exit(0);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const updateLicense: ICommand = {
  command: 'license',
  describe: 'Update an existing license',
  builder,
  handler,
};
