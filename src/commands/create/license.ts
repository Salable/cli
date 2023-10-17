import { CommandBuilder } from 'yargs';
import { CREATE_PRODUCT_NAME_QUESTION_OPTION } from '../../constants';
import ErrorResponse from '../../error-response';
import { CREATE_LICENSE_QUESTIONS } from '../../questions';
import {
  ICommand,
  ICreateLicenseQuestionAnswers,
  ICreatePlanQuestionAnswers,
  ICreateProductQuestionAnswers,
  ILicense,
  IPlan,
  IProduct,
} from '../../types';
import { dataChooser } from '../../utils/data-chooser';
import { processAnswers } from '../../utils/process-answers';
import { RequestBase } from '../../utils/request-base';
import { log } from '../../utils';

const builder: CommandBuilder = {
  productName: {
    type: 'string',
    description: 'The product to create the license on',
    default: '',
  },
  planName: {
    type: 'string',
    description: 'The plan to create the license on',
    default: '',
  },
  granteeId: {
    type: 'string',
    description: 'The grantee id for the license',
    default: '',
  },
  licenseeEmail: {
    type: 'string',
    description: 'The email address for the licensee',
    default: '',
  },
  endDate: {
    type: 'string',
    description: 'The end date for the license',
    default: '',
  },
};

const handler = async () => {
  try {
    const PRODUCT_NAME_CHOICES = [CREATE_PRODUCT_NAME_QUESTION_OPTION];

    // 1. Prompt the user for the product they want to create the license on
    const selectedProduct = await dataChooser<
      IProduct,
      ICreateLicenseQuestionAnswers,
      ICreateProductQuestionAnswers
    >({
      question: CREATE_LICENSE_QUESTIONS.PRODUCT_NAME(PRODUCT_NAME_CHOICES),
      startingChoices: PRODUCT_NAME_CHOICES,
      endpoint: 'products',
      targetField: 'productName',
    });

    // 1a. If no uuid can be found for the product selected, show an error and exit
    if (!selectedProduct?.uuid) {
      log.error('Cannot find uuid for the selected product, exiting...');
      return;
    }

    // 1b. Create list of planNames to choose from
    const PLAN_NAME_CHOICES = selectedProduct?.plans.map((plan) => plan.name);

    // 2. Prompt the user for the plan they want to create the license on from the product they selected.
    const selectedPlan = await dataChooser<
      IPlan,
      ICreateLicenseQuestionAnswers,
      ICreatePlanQuestionAnswers
    >({
      question: CREATE_LICENSE_QUESTIONS.PLAN_NAME(PLAN_NAME_CHOICES),
      startingChoices: PLAN_NAME_CHOICES,
      endpoint: `products/${selectedProduct?.uuid}/plans`,
      targetField: 'planName',
    });

    // 2a. If no uuid can be found for the plan selected, show an error and exit
    if (!selectedPlan?.uuid) {
      log.error('Cannot find uuid for the selected plan, exiting...');
      return;
    }

    // 3. Prompt the user for licence info
    const {
      granteeId,
      licenseeEmail: email,
      endDate,
    } = await processAnswers<ICreateLicenseQuestionAnswers>([
      CREATE_LICENSE_QUESTIONS.GRANTEE_ID,
      CREATE_LICENSE_QUESTIONS.LICENSEE_EMAIL,
      CREATE_LICENSE_QUESTIONS.END_DATE,
    ]);

    const [parsedDate] = new Date(endDate).toISOString().split('T');

    // 4. Perform POST request to create the license
    await RequestBase<ILicense>({
      method: 'POST',
      endpoint: 'licenses',
      body: {
        email,
        granteeId,
        endDate: parsedDate,
        planUuid: selectedPlan?.uuid,
      },
    });

    log.success(
      `License for ${email} on the product ${selectedProduct?.name || ''} was created succesfully`
    );
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    log.error(e.message).exit(1);
  }
};

export const createLicense: ICommand = {
  command: 'license',
  describe: 'Create a new license',
  builder,
  handler,
};
