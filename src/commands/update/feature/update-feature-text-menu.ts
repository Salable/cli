import { CREATE_FEATURE_QUESTIONS } from '../../../constants';
import { UPDATE_FEATURE_QUESTIONS } from '../../../questions';
import { IFeatureEnumOption, IUpdateFeatureQuestionAnswers } from '../../../types';
import { processAnswers } from '../../../utils';

export const updateFeatureTextMenu = async (defaultOptions?: IFeatureEnumOption[]) => {
  let loopTextCreate = true;
  const textOptions: IFeatureEnumOption[] = [...(defaultOptions || [])];

  // 0. Loop through the existing options to allow updating
  while (loopTextCreate) {
    const enumNames = textOptions.map(({ name }) => name);
    // 2b. Prompt the user to choose an item from the menu
    const { updateTextMenuOption } = await processAnswers<
      Pick<IUpdateFeatureQuestionAnswers, 'updateTextMenuOption'>
    >(UPDATE_FEATURE_QUESTIONS.TEXT_UPDATE_OPTIONS(enumNames));

    // 2b1. If the user choose the continue option, exit the loop.
    if (updateTextMenuOption === CREATE_FEATURE_QUESTIONS.TEXT_PLAN_MENU.CONTINUE) {
      loopTextCreate = false;
      break;
    }

    // 2b2. If the user chooses to update a text option prompt from it's new name and update it in the original item
    const { updateTextOption } = await processAnswers<
      Pick<IUpdateFeatureQuestionAnswers, 'updateTextOption'>
    >(UPDATE_FEATURE_QUESTIONS.TEXT_UPDATE(updateTextMenuOption));

    const selectedEnumIndex = textOptions.findIndex(({ name }) => name === updateTextMenuOption);

    textOptions[selectedEnumIndex].name = updateTextOption;
  }

  // 3. Return the final textOptions created after the user chooses the continue option
  return textOptions;
};
