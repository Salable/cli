import { CREATE_FEATURE_QUESTIONS } from '../../../constants';
import { CREATE_FEATURES_QUESTIONS } from '../../../questions';
import { ICreateFeatureQuestionAnswers } from '../../../types';
import { processAnswers } from '../../../utils';

export const planTextMenu = async (defaultOptions?: string[]) => {
  let loopTextCreate = true;
  let textOptions: string[] = [...(defaultOptions || [])];
  let chosenOption = '';

  // 0. Loop through the menu to create and delete text options for the feature
  while (loopTextCreate) {
    // 2a. If there are no options to pick from, ask the user to create one
    if (!textOptions.length) {
      const { createTextOption } = await processAnswers<
        Pick<ICreateFeatureQuestionAnswers, 'createTextOption'>
      >(CREATE_FEATURES_QUESTIONS.TEXT_CREATE_OPTION);

      textOptions.push(createTextOption);
    }

    // 2b. Prompt the user to choose an item from the menu
    const { createTextMenuOption } = await processAnswers<
      Pick<ICreateFeatureQuestionAnswers, 'createTextMenuOption'>
    >(CREATE_FEATURES_QUESTIONS.TEXT_CREATE_OPTION_MENU);

    chosenOption = createTextMenuOption;

    // 2b1. If the user choose the continue option, exit the loop.
    if (chosenOption === CREATE_FEATURE_QUESTIONS.TEXT_PLAN_MENU.CONTINUE) {
      loopTextCreate = false;
      break;
    }

    // 2b2. If the user choose the create option, prompt them to create a new option and then reprompt the user for a menu selection.
    if (chosenOption === CREATE_FEATURE_QUESTIONS.TEXT_PLAN_MENU.CREATE || !textOptions.length) {
      const { createTextOption } = await processAnswers<
        Pick<ICreateFeatureQuestionAnswers, 'createTextOption'>
      >(CREATE_FEATURES_QUESTIONS.TEXT_CREATE_OPTION);

      textOptions.push(createTextOption);
    }

    // 2b3. If the user choose the delete option, remove the item selected and then reprompt the user for a menu selection.
    if (chosenOption === CREATE_FEATURE_QUESTIONS.TEXT_PLAN_MENU.DELETE) {
      const { deleteTextOption } = await processAnswers<
        Pick<ICreateFeatureQuestionAnswers, 'deleteTextOption'>
      >(CREATE_FEATURES_QUESTIONS.TEXT_DELETE_OPTION(textOptions));

      textOptions = textOptions.filter((option) => option !== deleteTextOption);
    }
  }

  // 3. Return the final textOptions created after the user chooses the continue option
  return textOptions;
};
