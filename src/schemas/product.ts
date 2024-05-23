import { z } from 'zod';
import { planSchema } from './plan';
import { booleanFeatureSchema, numericFeatureSchema, textFeatureSchema } from './feature';

export const productSchema = z.array(
  z
    .object({
      name: z.string(),
      slug: z.string(),
      displayName: z.string(),
      description: z.string().optional(),
      appType: z.enum(['Trello', 'Miro', 'Custom']),
      paid: z.boolean(),
      currency: z.enum(['GBP', 'USD', 'EUR']),
      features: z
        .discriminatedUnion('type', [booleanFeatureSchema, numericFeatureSchema, textFeatureSchema])
        .refine((val) => {
          if (val.type === 'Text') {
            return val.options.includes(val.defaultValue);
          }

          if (val.type === 'Numerical') {
            return !(!val.showUnlimited && val.defaultValue === 'Unlimited');
          }

          return true;
        })
        .array(),
      plans: z.array(planSchema),
      capabilities: z.array(z.string()),
    })
    .refine(
      (value) => {
        return value.paid || (!value.paid && value.plans.every((p) => p.planPricing === 'Free'));
      },
      (value) => ({
        message: `Product: ${value.name} is a free product, it cannot contain paid plans.`,
      })
    )
);
