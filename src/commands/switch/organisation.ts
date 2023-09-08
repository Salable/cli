import { RequestBase } from '../../utils/request-base';
import chalk from 'chalk';
import ErrorResponse from '../../error-response';
import { ICommand, IOrganisation, ISwitchOrganisationQuestionAnswers } from '../../types';
import { CommandBuilder } from 'yargs';
import { getProperty, processAnswers, updateLineSalableRc } from '../../utils';
import { SWITCH_ORGANISATION_QUESTIONS } from '../../questions';

const builder: CommandBuilder = {};

const handler = async () => {
  try {
    const organisations = await RequestBase<IOrganisation[]>({
      method: 'GET',
      endpoint: `organisations`,
    });

    if (!organisations) {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`No organisations found`));
      return;
    }

    const orgNames = organisations.map((org) => org.name);

    const { organisation } = await processAnswers<ISwitchOrganisationQuestionAnswers>(
      SWITCH_ORGANISATION_QUESTIONS.ORGANISATION(orgNames)
    );

    const targetOrg = organisations.find((org) => org.name === organisation);

    if (!targetOrg) {
      // eslint-disable-next-line no-console
      console.error(chalk.red('Specified organisation cannot be found. Please try again.'));
      return;
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
      // eslint-disable-next-line no-console
      console.error(chalk.red('Something went wrong, please try again...'));
      return;
    }

    await updateLineSalableRc('ACCESS_TOKEN', newSessionToken);

    // eslint-disable-next-line no-console
    console.log(chalk.green(`Successfully switched to the organisation: ${targetOrg?.name}`));
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    // eslint-disable-next-line no-console
    console.error(chalk.red(e.message));
  }
};

export const switchOrganisation: ICommand = {
  command: 'organisation',
  describe: 'Switch your active Salable Organisation',
  builder,
  handler,
};
