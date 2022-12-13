import { CREATE_FEATURE_QUESTIONS } from '../../../constants';
import { CREATE_FEATURES_QUESTIONS } from '../../../questions';
import { ICreateFeatureQuestionAnswers } from '../../../types';
import { processAnswers } from '../../../utils/process-answers';

export const planTextMenu = async () => {
  let loopTextCreate = true;
  let showMenu = true;
  let textOptions: string[] = [];

  // 0. Loop through the menu to create and delete text options for the feature
  while (loopTextCreate) {
    // 1. Prompt the user to create a text option to add to the menu.
    const { createTextOption } = await processAnswers<
      Pick<ICreateFeatureQuestionAnswers, 'createTextOption'>
    >(CREATE_FEATURES_QUESTIONS.TEXT_CREATE_OPTION_MENU);

    textOptions.push(createTextOption);

    // 2. While `showMenu` is true, show the menu to the user
    while (showMenu) {
      // 2a. If there are no options in the list, skip the menu back to the 'create an option' question
      if (!textOptions?.length) {
        showMenu = false;
        break;
      }

      // 2b. Prompt the user to choose an item from the menu
      const { createTextMenuOption } = await processAnswers<
        Pick<ICreateFeatureQuestionAnswers, 'createTextMenuOption'>
      >(CREATE_FEATURES_QUESTIONS.TEXT_CREATE_OPTION_MENU);

      // 2b1. If the user choose the continue option, exit both loops.
      if (
        createTextMenuOption ===
        CREATE_FEATURE_QUESTIONS.TEXT_PLAN_MENU.CONTINUE
      ) {
        loopTextCreate = false;
        showMenu = false;
      }

      // 2b2. If the user choose the create option, exit the menu and prompt them to create a new option
      if (
        createTextMenuOption === CREATE_FEATURE_QUESTIONS.TEXT_PLAN_MENU.CREATE
      ) {
        showMenu = false;
      }

      // 2b3. If the user choose the delete option, remove the item selected and then reprompt the user for a menu selection.
      if (
        createTextMenuOption === CREATE_FEATURE_QUESTIONS.TEXT_PLAN_MENU.DELETE
      ) {
        const { deleteTextOption } = await processAnswers<
          Pick<ICreateFeatureQuestionAnswers, 'deleteTextOption'>
        >(CREATE_FEATURES_QUESTIONS.TEXT_DELETE_OPTION(textOptions));

        textOptions = textOptions.filter(
          (option) => option !== deleteTextOption
        );
      }
    }
  }

  // 3. Return the final textOptions created after the user chooses the continue option
  return textOptions;
};
