import { z } from 'zod';

export const FundingCurrencySchema = z.enum(['USDC', 'USDT']);
export type FundingCurrency = z.infer<typeof FundingCurrencySchema>;
