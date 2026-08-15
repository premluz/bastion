import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnalystConsensus } from './AnalystConsensus';

const meta: Meta<typeof AnalystConsensus> = {
  title: 'Nodes/AnalystConsensus',
  component: AnalystConsensus,
};
export default meta;
type Story = StoryObj<typeof AnalystConsensus>;

// Literal-prop node: "Happy/Partial/Empty" are representative value
// variations, not missing-data states (no bind, same convention as
// RingGauge/ConfidenceMeter's own stories) — Happy drawn from the real
// South Bow Corp authored data (universe/analystConsensus.json) for
// authenticity.
export const Happy: Story = {
  args: {
    consensus: {
      asOf: '2026-08-10',
      distribution: { bearish: 1, neutral: 4, bullish: 7 },
      priceTargets: { low: 34.5, average: 44.8, high: 52, current: 40.34 },
    },
  },
};

// Genuinely split coverage — a real "uncertain" case, not just a smaller
// number of the same shape.
export const Partial: Story = {
  args: {
    consensus: {
      asOf: '2026-08-08',
      distribution: { bearish: 2, neutral: 3, bullish: 4 },
      priceTargets: { low: 2.6, average: 3.9, high: 5.25, current: 3.47 },
    },
  },
};

// No analyst coverage at all yet — every segment/marker still renders
// (current price alone still has meaning), zero bars fill.
export const Empty: Story = {
  args: {
    consensus: {
      asOf: '2026-08-01',
      distribution: { bearish: 0, neutral: 0, bullish: 0 },
      priceTargets: { low: 40.34, average: 40.34, high: 40.34, current: 40.34 },
    },
  },
};
