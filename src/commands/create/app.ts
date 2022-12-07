import * as fs from 'fs';
import * as path from 'path';
import * as template from '../../utils/template';
import chalk from 'chalk';

import { isProd } from '../../config';
import inquirer, { Answers } from 'inquirer';
import ErrorResponse from '../../error-response';
import {
  IApiKey,
  ICommand,
  ICreateApiKeyQuestionAnswers,
  ICreateAppQuestionAnswers,
  TemplateData,
} from '../../types';
import { execPromise } from '../../utils/exec-promise';
import {
  ARGUMENT_SEPARATOR,
  COMMAND_BASE,
  CREATE_API_KEY_QUESTION_OPTION,
} from '../../constants';
import {
  CREATE_API_KEY_QUESTIONS,
  CREATE_APP_API_KEY_QUESTION,
  CREATE_APP_QUESTIONS,
} from '../../questions';
import { processAnswers } from '../../utils/process-answers';
import { fetchData } from '../../utils/fetch-data';

export interface TemplateConfig {
  files?: string[];
  postMessage?: string;
}

export interface CliOptions {
  projectName: string;
  templateName: string;
  templatePath: string;
  tartgetPath: string;
  config: TemplateConfig;
}

const SKIP_FILES = ['node_modules', '.template.json'];

const templateDirPath = isProd ? './templates/' : '../../templates/';

const TEMPLATE_CHOICES = fs.readdirSync(path.join(__dirname, templateDirPath));

const API_KEY_CHOICES = [CREATE_API_KEY_QUESTION_OPTION];
const API_KEYS_NAME_QUESTION = CREATE_APP_API_KEY_QUESTION([
  CREATE_API_KEY_QUESTION_OPTION,
]);

const builder = {
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

const CURR_DIR = process.cwd();

const showMessage = (options: CliOptions) => {
  console.log('');
  console.log(chalk.green('Done.'));
  console.log(chalk.green(`Go into the project: cd ${options.projectName}`));

  const message = options.config.postMessage;

  if (message) {
    console.log('');
    console.log(chalk.yellow(message));
    console.log('');
  }
};

const getTemplateConfig = (templatePath: string): TemplateConfig => {
  const configPath = path.join(templatePath, '.template.json');

  if (!fs.existsSync(configPath)) return {};

  const templateConfigContent = fs.readFileSync(configPath);

  if (templateConfigContent) {
    return JSON.parse(templateConfigContent.toString()) as TemplateConfig;
  }

  return {};
};

const createProject = (projectPath: string) => {
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(`Folder ${projectPath} exists. Delete or use another name.`)
    );
    return false;
  }

  fs.mkdirSync(projectPath);
  return true;
};

const postProcess = async (options: CliOptions) => {
  if (isNode(options)) {
    return await postProcessNode(options);
  }
  return true;
};

const isNode = (options: CliOptions) => {
  return fs.existsSync(path.join(options.templatePath, 'package.json'));
};

const postProcessNode = async (options: CliOptions) => {
  let cmd = '';

  const { stdout: whichnpm } = await execPromise('which npm');
  const { stdout: whichyarn } = await execPromise('which yarn');

  if (whichnpm) {
    cmd = 'npm install';
  } else if (whichyarn) {
    cmd = 'yarn';
  }

  if (cmd) {
    const { stderr } = await execPromise(`cd ${options.projectName} && ${cmd}`);

    if (stderr) return false;
  } else {
    console.log(chalk.red('No yarn or npm found. Cannot run installation.'));
  }

  return true;
};

interface ICreateDirectoryContents {
  templatePath: string;
  projectName: string;
  templateData: TemplateData;
  config: TemplateConfig;
}

const createDirectoryContents = ({
  templatePath,
  projectName,
  templateData,
  config,
}: ICreateDirectoryContents) => {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, 'utf8');

      contents = template.render(contents, templateData);

      const writePath = path.join(CURR_DIR, projectName, file);
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      fs.mkdirSync(path.join(CURR_DIR, projectName, file));

      // recursive call
      createDirectoryContents({
        templatePath: path.join(templatePath, file),
        projectName: path.join(projectName, file),
        templateData,
        config,
      });
    }
  });
};

const handler = async () => {
  try {
    let loopCreate = false;
    let apiKeyName = '';
    let apiKeys: IApiKey[] = [];

    while (!loopCreate) {
      const { data, choices } = await fetchData<IApiKey>({
        choices: API_KEY_CHOICES,
        endpoint: 'api-keys',
      });

      apiKeys = data;
      API_KEYS_NAME_QUESTION.choices = choices;

      const apiKeyNameAnswer: Answers = await inquirer.prompt(
        API_KEYS_NAME_QUESTION
      );

      apiKeyName =
        processAnswers<ICreateAppQuestionAnswers>(apiKeyNameAnswer)['apiKey'];

      if (apiKeyName === CREATE_API_KEY_QUESTION_OPTION) {
        const createApiKeyAnswers: Answers = await inquirer.prompt(
          CREATE_API_KEY_QUESTIONS
        );

        const { name } =
          processAnswers<ICreateApiKeyQuestionAnswers>(createApiKeyAnswers);

        const CREATE_PRODUCT_COMMAND = `${COMMAND_BASE} create api-key ${ARGUMENT_SEPARATOR} --name="${name}"`;

        const { stdout, stderr } = await execPromise(CREATE_PRODUCT_COMMAND);

        console.log(chalk.green(stdout));

        if (stderr && isProd) {
          console.log(chalk.red(stderr));
          process.exit(1);
        }
      } else {
        loopCreate = true;
      }
    }

    const answers: Answers = await inquirer.prompt(
      CREATE_APP_QUESTIONS(TEMPLATE_CHOICES)
    );

    const { template, name } =
      processAnswers<ICreateAppQuestionAnswers>(answers);

    let apiKeyValue = '';

    const chosenApiKey = apiKeys.find(({ name }) => name === apiKeyName);

    apiKeyValue = chosenApiKey ? chosenApiKey?.value : '';

    const templatePath = path.join(__dirname, templateDirPath, template);
    const tartgetPath = path.join(CURR_DIR, name);
    const templateConfig = getTemplateConfig(templatePath);

    const options: CliOptions = {
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
        apiKey: apiKeyValue,
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
