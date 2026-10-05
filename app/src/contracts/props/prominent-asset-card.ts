import { z } from 'zod';
export const ProminentAssetCardPropsSchema = z.object({
  entityId: z.string().min(1), symbol: z.string().min(1),
  variant: z.enum(['perp', 'earn']).default('perp'),
  primary: z.string().min(1), secondary: z.string().min(1),
  badge: z.string().optional(), price: z.string().optional(), deltaPercent: z.number().optional(),
  href: z.string().min(1),
});
export type ProminentAssetCardProps = z.infer<typeof ProminentAssetCardPropsSchema>;
