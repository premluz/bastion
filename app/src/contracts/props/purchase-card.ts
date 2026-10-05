import { z } from 'zod';
import { FundingCurrencySchema } from './funding-choice';

export const PurchaseCardPropsSchema = z.object({
  title: z.string().min(1), currency: FundingCurrencySchema,
});
export type PurchaseCardProps = z.infer<typeof PurchaseCardPropsSchema>;
export const PurchaseDetailPropsSchema = z.object({
  label: z.string().min(1), value: z.string().optional(),
  kind: z.enum(['amount', 'detail', 'confirm']).default('detail'),
  confirmed: z.boolean().default(false),
});
export type PurchaseDetailProps = z.infer<typeof PurchaseDetailPropsSchema>;
