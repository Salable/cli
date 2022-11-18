import * as fs from 'fs';
import * as path from 'path';
import * as template from '../utils/template';
import chalk from 'chalk';
import * as yargs from 'yargs';
import { exec } from 'child_process';
import { isProd } from '../config';
import inquirer from 'inquirer';

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

const templateDirPath = isProd ? './templates/' : '../templates/';

const CHOICES = fs.readdirSync(path.join(__dirname, templateDirPath));

const QUESTIONS = [
  {
    name: 'template',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: CHOICES,
    when: () => !yargs.argv['template'],
  },
  {
    name: 'name',
    type: 'input',
    message: 'Project name:',
    when: () => !yargs.argv['name'],
    validate: (input: string) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return 'Project name may only include letters, numbers, underscores and hashes.';
    },
  },
];

const CURR_DIR = process.cwd();

function showMessage(options: CliOptions) {
  console.log('');
  console.log(chalk.green('Done.'));
  console.log(chalk.green(`Go into the project: cd ${options.projectName}`));

  const message = options.config.postMessage;

  if (message) {
    console.log('');
    console.log(chalk.yellow(message));
    console.log('');
  }
}

function getTemplateConfig(templatePath: string): TemplateConfig {
  const configPath = path.join(templatePath, '.template.json');

  if (!fs.existsSync(configPath)) return {};

  const templateConfigContent = fs.readFileSync(configPath);

  if (templateConfigContent) {
    return JSON.parse(templateConfigContent.toString()) as TemplateConfig;
  }

  return {};
}

function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(`Folder ${projectPath} exists. Delete or use another name.`)
    );
    return false;
  }

  fs.mkdirSync(projectPath);
  return true;
}

function postProcess(options: CliOptions) {
  if (isNode(options)) {
    return postProcessNode(options);
  }
  return true;
}

function isNode(options: CliOptions) {
  return fs.existsSync(path.join(options.templatePath, 'package.json'));
}

function postProcessNode(options: CliOptions) {
  exec(`cd ${options.tartgetPath}`);

  let cmd = '';

  if (exec('which npm')) {
    cmd = 'npm install';
  } else if (exec('which yarn')) {
    cmd = 'yarn';
  }

  if (cmd) {
    exec(cmd, (error, _, stderr) => {
      if (error || stderr) {
        return false;
      }
      return;
    });
  } else {
    console.log(chalk.red('No yarn or npm found. Cannot run installation.'));
  }

  return true;
}

function createDirectoryContents(
  templatePath: string,
  projectName: string,
  config: TemplateConfig
) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, 'utf8');

      contents = template.render(contents, { projectName });

      const writePath = path.join(CURR_DIR, projectName, file);
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      fs.mkdirSync(path.join(CURR_DIR, projectName, file));

      // recursive call
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(projectName, file),
        config
      );
    }
  });
}

const handler = async () => {
  try {
    const answers = await inquirer.prompt(QUESTIONS);

    let ans = answers as { [key: string]: string };
    ans = Object.assign({}, ans, yargs.argv);

    if (ans instanceof Object) {
      const projectChoice = ans['template'];
      const projectName = ans['name'];
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

      createDirectoryContents(templatePath, projectName, templateConfig);

      if (!postProcess(options)) {
        return;
      }

      showMessage(options);
    }
  } catch (err) {
    console.error(err);
  }
};

export const createApp = {
  command: 'create-app',
  desc: 'Create an example application using Salable',
  handler,
};
