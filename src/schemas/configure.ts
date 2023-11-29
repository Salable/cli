import { z } from 'zod';
import { settingsSchema } from './settings';
import { productSchema } from './product';

export const configureSchema = z.object({
  settings: settingsSchema,
  products: productSchema,
});
