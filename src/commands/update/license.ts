import chalk from 'chalk';
import { CommandBuilder } from 'yargs';
import ErrorResponse from '../../error-response';
import { UPDATE_LICENSE_QUESTIONS } from '../../questions';
import { ICommand, ILicense, IUpdateLicenseQuestionAnswers } from '../../types';
import { processAnswers } from '../../utils/process-answers';
import { RequestBase } from '../../utils/request-base';

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
      // eslint-disable-next-line no-console
      console.error(chalk.red('Cannot find that license, exiting...'));
      return;
    }

    // 2. Prompt the user for the new licence info
    const { granteeId } = await processAnswers<IUpdateLicenseQuestionAnswers>([
      UPDATE_LICENSE_QUESTIONS.GRANTEE_ID(licenseToUpdate.granteeId),
    ]);

    // 3. Perform PUT request to update the license
    await RequestBase<ILicense>({
      method: 'PUT',
      endpoint: `licenses/${licenseToUpdate.uuid}`,
      body: {
        granteeId,
      },
    });

    // eslint-disable-next-line no-console
    console.log(chalk.green(`License ${licenseToUpdate?.name || ''} was updated succesfully`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const updateLicense: ICommand = {
  command: 'license',
  describe: 'Update an existing license',
  builder,
  handler,
};
