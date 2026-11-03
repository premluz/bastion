import { z } from 'zod';
/** One end of a transfer: a person, drawn as their avatar, or — with `icon` — one of the user's own accounts. */
export const PaymentPartySchema = z.object({
  name: z.string().min(1),
  icon: z.enum(['wallet', 'house', 'coin']).optional(),
  /** Under the party: what the transfer does to it, e.g. "$3,475.45 → $3,285.45". */
  caption: z.string().optional(),
  /** What the caption settles to once the transfer lands, e.g. "$3,285.45": the result stays on screen. */
  outcome: z.string().optional(),
});
/** A row under the amount. Only what matters for this transfer (2026-10-31): an internal move has no network fee. */
export const PaymentDetailSchema = z.object({ label: z.string().min(1), value: z.string().min(1) });
export const PaymentCardPropsSchema = z.object({
  title: z.string().min(1),
  /** Omitted: the user. */
  from: PaymentPartySchema.optional(), to: PaymentPartySchema,
  amount: z.string(), purpose: z.string(), details: z.array(PaymentDetailSchema).default([]),
  balance: z.string(), note: z.string().default(''), error: z.string().default(''),
  presentation: z.enum(['overlay', 'inline']).default('overlay'),
  mode: z.enum(['review', 'editing', 'funding', 'confirming', 'sending', 'sent', 'cancelled']).default('review'),
});
export type PaymentParty = z.infer<typeof PaymentPartySchema>;
export type PaymentCardProps = z.infer<typeof PaymentCardPropsSchema>;
