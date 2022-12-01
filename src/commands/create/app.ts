import * as fs from 'fs';
import * as path from 'path';
import * as template from '../../utils/template';
import chalk from 'chalk';
import yargs from 'yargs';
import { exec } from 'child_process';
import { isProd } from '../../config';
import inquirer, { Answers } from 'inquirer';
import ErrorResponse from '../../error-response';
import { IApiKey, ICommand, TemplateData } from '../../types';
import { RequestBase } from '../../utils/request-base';
import util from 'util';

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

const execPromise = util.promisify(exec);

const SKIP_FILES = ['node_modules', '.template.json'];

const templateDirPath = isProd ? './templates/' : '../../templates/';

const API_KEYS: IApiKey[] = [];

const TEMPLATE_CHOICES = fs.readdirSync(path.join(__dirname, templateDirPath));
const API_KEY_CHOICES = ['Create a new API Key'];

const QUESTIONS = [
  {
    name: 'template',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: TEMPLATE_CHOICES,
    when: () => !Object.keys(yargs(process.argv).argv).includes('template'),
  },
  {
    name: 'name',
    type: 'input',
    message: 'Project name:',
    when: () => !Object.keys(yargs(process.argv).argv).includes('name'),
    validate: (input: string) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return 'Project name may only include letters, numbers, underscores and hashes.';
    },
  },
  {
    name: 'api-key',
    type: 'list',
    message: 'What api-key would you like to uset to generate the project?',
    choices: API_KEY_CHOICES,
    when: () => !Object.keys(yargs(process.argv).argv).includes('api-key'),
  },
  {
    name: 'new-api-key-name',
    type: 'input',
    message: 'What would you like to name the new API Key?',
    when: (answers: Answers) => answers['api-key'] === 'Create a new API Key',
  },
];

const builder = {
  template: {
    type: 'string',
    description: 'What project template would you like to generate?',
  },
  name: {
    type: 'string',
    description: 'What would you like to name your project?',
  },
  'api-key': {
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
    const apiKeys = await RequestBase<IApiKey[]>({
      method: 'GET',
      endpoint: 'api-keys',
    });

    if (Array.isArray(apiKeys) && apiKeys?.length) {
      const activeKeys = apiKeys.filter(
        ({ status }) => status !== 'DEPRECATED'
      );

      API_KEYS.unshift(...activeKeys);
      API_KEY_CHOICES.unshift(...activeKeys.map(({ name }) => name));
    }

    const answers = await inquirer.prompt(QUESTIONS);

    const ans = Object.assign({}, answers, yargs(process.argv).argv) as {
      [key: string]: string;
    };

    const projectChoice = ans['template'];
    const projectName = ans['name'];
    const apiKey = ans['api-key'];
    const apiKeyName = ans['new-api-key-name'];

    let apiKeyValue = '';

    if (apiKey === 'Create a new API Key') {
      const { stdout } = await execPromise(
        `npm run start create api-key -- --name="${apiKeyName}"`
      );

      apiKeyValue = stdout.split(':')[1].trim();
    } else {
      const chosenApiKey = API_KEYS.find(({ name }) => name === apiKey);

      apiKeyValue = chosenApiKey ? chosenApiKey?.value : '';
    }

    const templatePath = path.join(__dirname, templateDirPath, projectChoice);
    const tartgetPath = path.join(CURR_DIR, projectName);
    const templateConfig = getTemplateConfig(templatePath);

    const options: CliOptions = {
      projectName,
      templateName: projectChoice,
      templatePath,
      tartgetPath,
      config: templateConfig,
    };

    if (!createProject(tartgetPath)) {
      return;
    }

    createDirectoryContents({
      templatePath,
      projectName,
      templateData: {
        projectName,
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
