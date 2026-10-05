import { z } from 'zod';

// Leading visual, optional (2026-09-14, direct feedback: Money screen's
// activity list needs a person avatar, a spending-category icon, or a
// company logo — not just the crypto CoinLogo/trade-icon HistoryItem
// already renders). Discriminated on `kind` so a row can only carry one
// shape at a time. `category` is a closed enum, not a free string or an
// icon reference — the contract holds no JSX (rule 6); HistoryItem.tsx
// maps each category to a real heroicon, the same separation it already
// uses for entry.kind's own trade/interaction icon choice.
export const HistoryCategorySchema = z.enum(['travel', 'groceries', 'shopping', 'entertainment', 'transfer', 'other']);
export const HistoryAvatarSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('initials'), name: z.string().min(1) }),
  z.object({ kind: z.literal('category'), category: HistoryCategorySchema }),
]);

export const HistoryEntrySchema = z.object({
  id: z.string().min(1),
  accountId: z.string().min(1),
  occurredAt: z.iso.datetime(),
  kind: z.enum(['deposit', 'trade', 'transfer', 'purchase', 'interaction']),
  title: z.string().min(1),
  detail: z.string(),
  // Optional (2026-09-14): fiat/money activity (Money screen) has no
  // blockchain network — only crypto rows populate this.
  network: z.string().optional(),
  status: z.enum(['confirmed', 'pending', 'failed']),
  assetId: z.string().optional(),
  symbol: z.string().optional(),
  amount: z.number().nonnegative().optional(),
  direction: z.enum(['in', 'out']).optional(),
  avatar: HistoryAvatarSchema.optional(),
  // Pre-formatted trailing amount for fiat rows (2026-09-14) — formatHistoryAmount's
  // sign+symbol formatting is crypto-shaped (amount/symbol, up to 8 decimals);
  // fiat activity supplies its own display string (currency symbol, 2
  // decimals, mUSD suffix, etc.) rather than forcing that formatter to grow
  // a second currency mode it has no other consumer for.
  displayAmount: z.string().optional(),
});

export const HistoryItemPropsSchema = z.object({ entry: HistoryEntrySchema });
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;
export type HistoryAvatar = z.infer<typeof HistoryAvatarSchema>;
export type HistoryCategory = z.infer<typeof HistoryCategorySchema>;
