// Shared fiat/mUSD account summary (2026-09-14) — no real fiat-account
// concept exists in the universe seed, so this is an authored stand-in,
// same posture as AssetsHomeHeader's own crypto totals. Both the Home
// tab's "Money" BalanceCategoryCard and MoneyPage read this one object
// rather than each keeping an independent number that could drift.
export const MONEY_PLACEHOLDER = {
  value: 3475.45, changeAbs: 2.46, changePercent: 0.3, apy: 4, monthlyEarnings: 11.58, annualEarnings: 139.02,
} as const;
