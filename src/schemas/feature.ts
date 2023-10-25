import { z } from 'zod';

const baseFeatureSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  variableName: z.string(),
  description: z.string().optional(),
  visibility: z.enum(['Public', 'Private']),
});

export const booleanFeatureSchema = baseFeatureSchema.extend({
  type: z.literal('Boolean'),
  defaultValue: z.boolean(),
});

export const numericFeatureSchema = baseFeatureSchema.extend({
  type: z.literal('Numerical'),
  showUnlimited: z.boolean(),
  value: z.number(),
  defaultValue: z.literal('Unlimited').or(z.coerce.string().refine((val) => parseInt(val))),
});

export const textFeatureSchema = baseFeatureSchema.extend({
  type: z.literal('Text'),
  options: z.array(z.string()),
  defaultValue: z.string(),
});
