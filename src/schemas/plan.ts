import { z } from 'zod';

export const planSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  description: z.string().optional(),
  capabilities: z.array(z.string()),
  planType: z.enum(['Standard', 'Bespoke', 'Evaluation', 'Coming Soon']),
  planPricing: z.enum(['Free', 'Paid']),
  price: z.number().optional(),
  planCycle: z.object({
    interval: z.enum(['Month', 'Year']),
    quantity: z.number(),
  }),
  licenseType: z.literal('Licensed'),
  evaluationPeriod: z.number(),
  visibility: z.enum(['Public', 'Private']),
  published: z.boolean(),
});
