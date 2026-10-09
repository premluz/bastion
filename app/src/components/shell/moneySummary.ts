// Shared fiat/mUSD account summary (2026-09-14) — no real fiat-account
// concept exists in the universe seed, so this is an authored stand-in,
// same posture as AssetsHomeHeader's own crypto totals. Both the Home
// tab's "Money" BalanceCategoryCard and MoneyPage read this one object
// rather than each keeping an independent number that could drift.
export const MONEY_PLACEHOLDER = {
  value: 3475.45, changeAbs: 2.46, changePercent: 0.3, apy: 4, annualEarnings: 139.02,
  // Home's Money tile shows this as "Earning 6.4%" (2026-10-06, direct
  // feedback) — note it differs from the Money page's own 4% APY line.
  earningRate: 6.4,
} as const;
