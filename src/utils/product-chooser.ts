import chalk from 'chalk';
import { isProd } from '../config';
import {
  ARGUMENT_SEPARATOR,
  COMMAND_BASE,
  CREATE_PRODUCT_NAME_QUESTION_OPTION,
} from '../constants';
import { CREATE_PRODUCT_QUESTIONS } from '../questions';
import {
  ICreateCapabilityQuestionAnswers,
  ICreateProductQuestionAnswers,
  IProduct,
} from '../types';
import { execPromise } from './exec-promise';
import { fetchData } from './fetch-data';
import { processAnswers } from './process-answers';

interface IProps {
  productQuestion: {
    name: string;
    type: string;
    message: string;
    choices: string[];
    when: () => boolean;
  };
  productChoices: string[];
}

export const productChooser = async ({
  productQuestion,
  productChoices,
}: IProps) => {
  let loopCreate = true;
  let products: IProduct[] = [];
  let productName = '';

  // 1. Choose PRODUCT to create feature on
  while (loopCreate) {
    const { data, choices } = await fetchData<IProduct>({
      choices: productChoices,
      endpoint: 'products',
    });

    products = data;
    productQuestion.choices = choices;

    const { productName: selectedProductName } =
      await processAnswers<ICreateCapabilityQuestionAnswers>(productQuestion);

    productName = selectedProductName;

    if (productName === CREATE_PRODUCT_NAME_QUESTION_OPTION) {
      const { name, displayName, productDescription } =
        await processAnswers<ICreateProductQuestionAnswers>(
          CREATE_PRODUCT_QUESTIONS
        );

      const CREATE_PRODUCT_COMMAND = `${COMMAND_BASE} create product ${ARGUMENT_SEPARATOR} --name="${name}" --displayName="${displayName}" --productDescription="${productDescription}"`;

      const { stdout, stderr } = await execPromise(CREATE_PRODUCT_COMMAND);

      console.log(chalk.green(stdout));

      if (stderr && isProd) {
        console.log(chalk.red(stderr));
        process.exit(1);
      }
    } else {
      loopCreate = false;
    }
  }

  // Find the product they have selected
  const selectedProduct = products?.find(({ name }) => name === productName);

  return { selectedProduct };
};
