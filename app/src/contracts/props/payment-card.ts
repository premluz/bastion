import { z } from 'zod';
export const PaymentCardPropsSchema = z.object({
  title: z.string().min(1), recipient: z.string().min(1), amount: z.string(), purpose: z.string(),
  from: z.string(), fee: z.string(), arrival: z.string().default('Instantly'),
  balance: z.string(), note: z.string().default(''), error: z.string().default(''),
  presentation: z.enum(['overlay', 'inline']).default('overlay'),
  mode: z.enum(['review', 'editing', 'funding', 'confirming', 'sending', 'sent', 'cancelled']).default('review'),
});
export type PaymentCardProps = z.infer<typeof PaymentCardPropsSchema>;
