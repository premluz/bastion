import type { Meta, StoryObj } from '@storybook/react-vite';
import { KeyIssuesCard } from './KeyIssuesCard';

const meta: Meta<typeof KeyIssuesCard> = {
  title: 'Nodes/KeyIssuesCard',
  component: KeyIssuesCard,
};
export default meta;
type Story = StoryObj<typeof KeyIssuesCard>;

// Literal-prop node: content drawn from the real South Bow Corp fixture
// (universe/fixtures/equity-example.json) for authenticity.
export const Happy: Story = {
  args: {
    title: 'Key issues',
    issues: [
      {
        topic: 'Capacity expansion filing and regulatory review outcome',
        bullishView: {
          text: "The cross-border capacity expansion filing is backed by real, elevated trading volume (3.3M shares, triple the recent average) rather than speculative chatter, and RiskLens's own low-moderate 27/100 score reflects infrastructure cash flows that stay stable through the review period regardless of the outcome.",
          sources: [
            { name: 'MeridianFeed', ref: 'south-bow-corp-price-volume-90d' },
            { name: 'RiskLens', ref: 'south-bow-corp' },
          ],
        },
        bearishView: {
          text: 'The regulatory review for the export-terminal capacity increase is not yet decided, and the market has already given back roughly half its filing-day gain in the week since.',
          sources: [{ name: 'MeridianFeed', ref: 'south-bow-corp-price-volume-90d' }],
        },
      },
      {
        topic: 'Dividend durability amid expansion capex',
        bullishView: {
          text: 'PortfolioAtlas logs no change to the payout mandate despite the expansion capex plans — the 3.1% yield holds steady.',
          sources: [{ name: 'PortfolioAtlas', ref: 'south-bow-corp' }],
        },
        bearishView: {
          text: 'A capacity expansion of this size typically pressures free cash flow during the build-out window; the mandate being unchanged today doesn’t guarantee it stays unchanged once the capex cadence actually ramps.',
          sources: [
            { name: 'PortfolioAtlas', ref: 'south-bow-corp' },
            { name: 'RiskLens', ref: 'south-bow-corp' },
          ],
        },
      },
    ],
  },
};

// A single topic — still renders correctly with only one collapsible row.
export const Partial: Story = {
  args: {
    title: 'Key issues',
    issues: [
      {
        topic: 'ZIP-14 treasury buyback durability',
        bullishView: {
          text: 'The 41% move tracks a real, on-chain, sourced governance event, not an unexplained spike.',
          sources: [{ name: 'LedgerWatch', ref: 'zenith-protocol-price-volume-90d' }],
        },
        bearishView: {
          text: 'The token spent six weeks consolidating in a tight range immediately before this move.',
          sources: [{ name: 'LedgerWatch', ref: 'zenith-protocol-price-volume-90d' }],
        },
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    title: 'Key issues',
    issues: [],
  },
};
