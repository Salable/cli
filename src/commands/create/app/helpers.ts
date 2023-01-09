import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import {
  ICreateAppCliOptions,
  ICreateAppCreateDirectoryContents,
  ICreateAppTemplateConfig,
} from '../../../types';
import { execPromise, renderTemplate } from '../../../utils';

export const CURR_DIR = process.cwd();
const SKIP_FILES = ['node_modules', '.template.json'];

export const showMessage = (options: ICreateAppCliOptions) => {
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

export const getTemplateConfig = (
  templatePath: string
): ICreateAppTemplateConfig => {
  const configPath = path.join(templatePath, '.template.json');

  if (!fs.existsSync(configPath)) return {};

  const templateConfigContent = fs.readFileSync(configPath);

  if (templateConfigContent) {
    return JSON.parse(
      templateConfigContent.toString()
    ) as ICreateAppTemplateConfig;
  }

  return {};
};

export const createProject = (projectPath: string) => {
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(`Folder ${projectPath} exists. Delete or use another name.`)
    );
    return false;
  }

  fs.mkdirSync(projectPath);
  return true;
};

export const postProcess = async (options: ICreateAppCliOptions) => {
  if (isNode(options)) {
    return await postProcessNode(options);
  }
  return true;
};

export const isNode = (options: ICreateAppCliOptions) => {
  return fs.existsSync(path.join(options.templatePath, 'package.json'));
};

export const postProcessNode = async (options: ICreateAppCliOptions) => {
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

export const createDirectoryContents = ({
  templatePath,
  projectName,
  templateData,
  config,
}: ICreateAppCreateDirectoryContents) => {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach((file) => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, 'utf8');

      contents = renderTemplate(contents, templateData);

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
