import { z } from 'zod';
export const AssetRowPropsSchema = z.object({
  variant: z.enum(['owned', 'market']).default('owned'),
  entityId: z.string().min(1), name: z.string().min(1), symbol: z.string().min(1),
  value: z.string().min(1), deltaPercent: z.number(),
  quantity: z.string().default(''), marketCap: z.string().default(''), volume: z.string().default(''),
  badge: z.string().optional(), href: z.string().min(1), selected: z.boolean().default(false),
});
export type AssetRowProps = z.infer<typeof AssetRowPropsSchema>;
