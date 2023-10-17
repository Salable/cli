import { z } from 'zod';

export const settingsSchema = z.object({
  apiKeys: z.array(
    z.object({
      name: z.string(),
      roles: z.array(z.string()).default(['Admin']),
      scopes: z.array(z.string()),
    })
  ),
});
