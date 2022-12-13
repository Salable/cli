import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { isProd } from '../../../config';
import ErrorResponse from '../../../error-response';
import {
  IApiKey,
  ICommand,
  ICreateApiKeyQuestionAnswers,
  ICreateAppCliOptions,
  ICreateAppQuestionAnswers,
} from '../../../types';
import { CREATE_API_KEY_QUESTION_OPTION } from '../../../constants';
import { CREATE_APP_QUESTIONS } from '../../../questions';
import { processAnswers } from '../../../utils/process-answers';
import { CommandBuilder } from 'yargs';
import { dataChooser } from '../../../utils/data-chooser';
import {
  createDirectoryContents,
  createProject,
  CURR_DIR,
  getTemplateConfig,
  postProcess,
  showMessage,
} from './helpers';

const templateDirPath = isProd ? './templates/' : '../../../templates/';
const TEMPLATE_CHOICES = fs.readdirSync(path.join(__dirname, templateDirPath));
const API_KEY_CHOICES = [CREATE_API_KEY_QUESTION_OPTION];

const builder: CommandBuilder = {
  template: {
    type: 'string',
    description: 'What project template would you like to generate?',
  },
  name: {
    type: 'string',
    description: 'What would you like to name your project?',
  },
  apiKey: {
    type: 'string',
    description: 'What API key would you like to use to generate the project?',
  },
};

const handler = async () => {
  try {
    const selectedApiKey = await dataChooser<
      IApiKey,
      ICreateAppQuestionAnswers,
      ICreateApiKeyQuestionAnswers
    >({
      question: CREATE_APP_QUESTIONS.API_KEY([CREATE_API_KEY_QUESTION_OPTION]),
      startingChoices: API_KEY_CHOICES,
      endpoint: 'api-keys',
      targetField: 'apiKey',
    });

    const { template, name } = await processAnswers<ICreateAppQuestionAnswers>([
      CREATE_APP_QUESTIONS.TEMPLATE_NAME(TEMPLATE_CHOICES),
      CREATE_APP_QUESTIONS.PROJECT_NAME,
    ]);

    const templatePath = path.join(__dirname, templateDirPath, template);
    const tartgetPath = path.join(CURR_DIR, name);
    const templateConfig = getTemplateConfig(templatePath);

    const options: ICreateAppCliOptions = {
      projectName: name,
      templateName: template,
      templatePath,
      tartgetPath,
      config: templateConfig,
    };

    if (!createProject(tartgetPath)) {
      return;
    }

    createDirectoryContents({
      templatePath,
      projectName: name,
      templateData: {
        projectName: name,
        apiKey: selectedApiKey?.value || '',
      },
      config: templateConfig,
    });

    if (!(await postProcess(options))) {
      return;
    }

    showMessage(options);
  } catch (e) {
    if (!(e instanceof ErrorResponse)) return;

    console.error(chalk.red(e.message));
  }
};

export const createApp: ICommand = {
  command: 'app',
  describe: 'Create an example project using Salable',
  builder,
  handler,
};
