/* eslint-disable no-console */
import { writeFile } from 'node:fs';
import path from 'node:path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { configureSchema } from '../src/schemas/configure';

const schema = zodToJsonSchema(configureSchema);
writeFile(path.resolve('./dist/schema.json'), JSON.stringify(schema), (err) => {
  if (err === null) {
    console.log('Generated configure schema JSON...');
    return;
  }
  console.error('Failed to generate schema...');
});
