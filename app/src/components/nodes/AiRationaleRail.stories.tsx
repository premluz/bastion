import type { Meta, StoryObj } from '@storybook/react-vite';
import { AiRationaleRail } from './AiRationaleRail';

const meta: Meta<typeof AiRationaleRail> = {
  title: 'Nodes/AiRationaleRail',
  component: AiRationaleRail,
};
export default meta;
type Story = StoryObj<typeof AiRationaleRail>;

// Literal-prop node: content drawn from the real Zenith Protocol fixture
// (universe/fixtures/crypto-example.json) for authenticity.
export const Happy: Story = {
  args: {
    summary:
      "Zenith Protocol's 41% single-day move tracks the passage of ZIP-14, a governance proposal authorizing a protocol-funded treasury buyback — a real, on-chain, sourced event rather than an unexplained spike. Prior to this, the token had spent six weeks consolidating in a $3.30–$3.80 range on moderate liquidity, so the move is a sharp break from an otherwise settled trend.",
    sources: [{ name: 'LedgerWatch', ref: 'zenith-protocol-price-volume-90d' }],
    asOf: '2026-07-02',
  },
};

// Multiple sources cited together — a real, more heavily corroborated
// case, not just a smaller instance of the same shape.
export const Partial: Story = {
  args: {
    summary:
      "South Bow Corp's rally is backed by real volume and a concrete capacity-expansion filing, not speculative froth — but the position has already given back roughly half its filing-day gain, and RiskLens's 27/100 reads the move as low-moderate risk pending the regulatory review outcome.",
    sources: [
      { name: 'MeridianFeed', ref: 'south-bow-corp-price-volume-90d' },
      { name: 'RiskLens', ref: 'south-bow-corp' },
      { name: 'PortfolioAtlas', ref: 'south-bow-corp' },
    ],
    asOf: '2026-07-02',
  },
};

// Shortest viable summary — one sentence, one source, confirms the layout
// doesn't depend on a long paragraph to read correctly.
export const Empty: Story = {
  args: {
    summary: 'No notable move detected in the current window.',
    sources: [{ name: 'MarketTape', ref: 'south-bow-corp-price-volume-90d' }],
    asOf: '2026-07-02',
  },
};
