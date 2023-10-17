import { RequestBase } from '../../utils/request-base';
import ErrorResponse from '../../error-response';
import { ICommand, IOrganisation, ISwitchOrganisationQuestionAnswers } from '../../types';
import { CommandBuilder } from 'yargs';
import { getProperty, log, processAnswers, updateLineSalableRc } from '../../utils';
import { SWITCH_ORGANISATION_QUESTIONS } from '../../questions';

const builder: CommandBuilder = {};

const handler = async () => {
  try {
    const organisations = await RequestBase<IOrganisation[]>({
      method: 'GET',
      endpoint: `organisations`,
    });

    if (!organisations) {
      throw new Error(`No organisations found`);
    }

    const orgNames = organisations.map((org) => org.name);

    const { organisation } = await processAnswers<ISwitchOrganisationQuestionAnswers>(
      SWITCH_ORGANISATION_QUESTIONS.ORGANISATION(orgNames)
    );

    const targetOrg = organisations.find((org) => org.name === organisation);

    if (!targetOrg) {
      throw new Error('Specified organisation cannot be found. Please try again.');
    }

    const currentToken = await getProperty('ACCESS_TOKEN');

    const newSessionToken = await RequestBase<string>({
      method: 'POST',
      endpoint: `cli/switch-organisation`,
      body: {
        organisation: targetOrg.name,
      },
    });

    if (!currentToken || !newSessionToken) {
      throw new Error('Something went wrong, please try again...');
    }

    await updateLineSalableRc('ACCESS_TOKEN', newSessionToken);

    log.success(`Successfully switched to the organisation: ${targetOrg?.name}`).exit(0);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const switchOrganisation: ICommand = {
  command: 'organisation',
  describe: 'Switch your active Salable Organisation',
  builder,
  handler,
};
