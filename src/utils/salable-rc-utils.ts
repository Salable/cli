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
export const createSalableRc = (accessToken: string, testMode: string) => {
  if (salableRcExists) return;

  fs.writeFileSync(
    salableRcPath,
    `ACCESS_TOKEN=${accessToken}
  TEST_MODE=${testMode}
  `
  );
};

export const removeLineSalableRc = async (searchString: string) => {
  const regex = new RegExp(`${searchString}.*`);

  const fileContents = await getFileContents();

  if (fileContents.toString().match(regex)) {
    const newLine = fileContents.toString().replace(regex, '');

    return await fs.promises.writeFile(salableRcPath, newLine);
  }
};

/**
 *  Update the existing `.salablerc` file, replace the line with `searchString` on to be `newValue` instead.
 **/
export const updateLineSalableRc = async (
  searchString: 'ACCESS_TOKEN' | 'TEST_MODE',
  newValue: string
) => {
  const regex = new RegExp(`${searchString}.*`);

  const fileContents = await getFileContents();

  // Test if the search string exists in the file
  if (regex.test(fileContents.toString())) {
    const newLine = fileContents.toString().replace(regex, `${searchString}=${newValue}`);

    return await fs.promises.writeFile(salableRcPath, newLine);
  }

  // If the string doesn't exist in the file then append it and it's value to the end of it
  return await fs.promises.writeFile(
    salableRcPath,
    `${fileContents.toString()}
${searchString}=${newValue}`
  );
};

/**
 *  Fetch the requested property from the `.salablerc` file
 **/
export const getProperty = async (
  type: 'ACCESS_TOKEN' | 'REFRESH_TOKEN' | 'ORGANISATION' | 'TEST_MODE'
) => {
  try {
    const fileContents = await getFileContents();

    const splitStrings = fileContents.toString().split('\n');
    const [propertyLine] = splitStrings.filter((string) => string.includes(type));

    if (!propertyLine) return undefined;

    return propertyLine.split('=')[1];
  } catch (e) {
    return undefined;
  }
};
