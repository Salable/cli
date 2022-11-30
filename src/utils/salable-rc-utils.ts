import fs from 'fs';
import path from 'path';
import { rootDir } from '../config';

export const salableRcPath = path.resolve(rootDir, '.salablerc');

export const salableRcExists = fs.existsSync(salableRcPath);

/**
 * Get the file contents of the `.salablerc` file.
 **/
const getFileContents = async () => {
  return await fs.promises.readFile(salableRcPath);
};

/**
 * Create the `.salablerc` file if it does not already exist.
 **/
export const createSalableRc = (accessToken: string, refreshToken: string) => {
  if (salableRcExists) return;

  fs.writeFileSync(
    salableRcPath,
    `ACCESS_TOKEN=${accessToken}
REFRESH_TOKEN=${refreshToken}`
  );
};

/**
 *  Update the existing `.salablerc` file, replace the line with `searchString` on to be `newValue` instead.
 **/
export const updateSalableRc = async (
  searchString: string,
  newValue: string
) => {
  const regex = new RegExp(`${searchString}.*`);

  const fileContents = await getFileContents();

  const newLine = fileContents
    .toString()
    .replace(regex, `${searchString}=${newValue}`);

  await fs.promises.writeFile(salableRcPath, newLine);
};

/**
 *  Fetch the requested token from the `.salablerc` file
 **/
export const getToken = async (type: 'ACCESS_TOKEN' | 'REFRESH_TOKEN') => {
  const fileContents = await getFileContents();

  const splitStrings = fileContents.toString().split('\n');
  const [tokenLine] = splitStrings.filter((string) => string.includes(type));

  if (!tokenLine) return undefined;

  const token = tokenLine.split('=')[1];

  return token;
};
