import type { Meta, StoryObj } from '@storybook/react-vite';
import { PriceMovementTimeline } from './PriceMovementTimeline';

const meta: Meta<typeof PriceMovementTimeline> = {
  title: 'Nodes/PriceMovementTimeline',
  component: PriceMovementTimeline,
};
export default meta;
type Story = StoryObj<typeof PriceMovementTimeline>;

// Literal-prop node: content drawn from the real South Bow Corp fixture
// (universe/fixtures/equity-example.json) for authenticity.
export const Happy: Story = {
  args: {
    title: 'Notable price movement',
    entries: [
      {
        id: 'sbow-2026-06-21-filing',
        date: '2026-06-21',
        headline: "South Bow Corp jumps on cross-border capacity expansion filing",
        detail: 'Shares gain nearly 5% intraday as the pipeline operator files for additional export-terminal throughput.',
        source: { name: 'MeridianFeed', ref: 'south-bow-corp-price-volume-90d' },
        price: 42.93,
        changePct: 4.48,
      },
      {
        id: 'sbow-2026-06-24-risklens',
        date: '2026-06-24',
        headline: "RiskLens reads South Bow Corp's risk profile as low-moderate despite the expansion filing",
        detail: 'Score of 27/100 reflects stable infrastructure cash flows even amid the regulatory review ahead.',
        source: { name: 'RiskLens', ref: 'south-bow-corp' },
        price: 41.7,
        changePct: -0.71,
      },
      {
        id: 'sbow-2026-06-27-giveback',
        date: '2026-06-27',
        headline: 'South Bow Corp gives back half its filing-day gain over the following week',
        detail: 'Shares ease from 42.93 to the low 40s as the initial reaction cools.',
        source: { name: 'MeridianFeed', ref: 'south-bow-corp-price-volume-90d' },
        price: 40.35,
        changePct: -6.01,
      },
    ],
  },
};

// A single entry — still renders correctly with only one row.
export const Partial: Story = {
  args: {
    title: 'Notable price movement',
    entries: [
      {
        id: 'znth-2026-07-02-proposal',
        date: '2026-07-02',
        headline: 'Zenith Protocol jumps 41% on passage of the treasury buyback proposal',
        detail: 'Governance vote ZIP-14 authorizes a protocol-funded token buyback from treasury reserves.',
        source: { name: 'LedgerWatch', ref: 'zenith-protocol-price-volume-90d' },
        price: 4.95,
        changePct: 41.03,
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    title: 'Notable price movement',
    entries: [],
  },
};
