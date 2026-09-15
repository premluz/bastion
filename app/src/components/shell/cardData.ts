// Made-up card data (2026-09-15) — no real card-issuing concept exists in
// the universe seed; authored placeholders, same posture as
// moneyHistoryData.ts/moneySummary.ts. lastFourDigits is a fixed mock
// value, not a real card number fragment.
export interface WalletCard {
  id: string;
  name: string;
  lastFourDigits: string;
  cashbackPercent: number;
}

export const WALLET_CARDS: WalletCard[] = [
  { id: 'card-metal', name: 'Metal card', lastFourDigits: '4283', cashbackPercent: 3 },
  { id: 'card-virtual', name: 'Virtual card', lastFourDigits: '7710', cashbackPercent: 1 },
  // Third card added 2026-09-16 so the deck has a real 3-layer stack
  // matching the reference — the spec's own "if there are only two
  // cards, avoid a fake third-card layer" rule means the layer has to
  // come from real data, never a synthesised filler in the renderer.
  { id: 'card-travel', name: 'Travel card', lastFourDigits: '5192', cashbackPercent: 2 },
];
