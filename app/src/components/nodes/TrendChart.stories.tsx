import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrendChart } from './TrendChart';

// Bastion fork note: Merlin's Happy/Partial stories drew content from its
// own universe/fixtures/*.json (South Bow Corp/Zenith Protocol), deleted
// per the fork spec's "prune, don't adapt" rule for universe content —
// authoring Bastion's own fixtures is out of scope for this pass (see
// CLAUDE.md §10). Replaced with minimal inline placeholder series so the
// story keeps exercising the same prop shapes without importing deleted
// fixture data.
const PLACEHOLDER_SERIES = [
  { t: '2026-01-01', price: 40.0 },
  { t: '2026-02-01', price: 42.5 },
  { t: '2026-03-01', price: 39.8 },
  { t: '2026-04-01', price: 44.1 },
];
const PLACEHOLDER_COMPARE_SERIES = [
  { label: 'Benchmark', series: PLACEHOLDER_SERIES.map((p) => ({ ...p, price: p.price * 0.9 })) },
];

const meta: Meta<typeof TrendChart> = {
  title: 'Nodes/TrendChart',
  component: TrendChart,
  decorators: [(Story) => <div style={{ width: '600px' }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof TrendChart>;

// Literal-prop node: fixed-width story wrapper (merlin-new-node skill §2),
// same reasoning as EarningsHistoryChart's own story.
export const Happy: Story = {
  args: {
    title: 'Price',
    series: PLACEHOLDER_SERIES,
    periods: ['1M', 'YTD', 'MAX'],
    compareSeries: PLACEHOLDER_COMPARE_SERIES,
  },
};

// No compareSeries — genuinely absent, not every asset carries a
// comparison line.
export const Partial: Story = {
  args: {
    title: 'Price',
    series: PLACEHOLDER_SERIES,
    periods: ['1M', 'YTD', 'MAX'],
  },
};

export const Empty: Story = {
  args: {
    title: 'Price',
    series: [{ t: '2026-07-02', price: 40.33 }],
    periods: ['MAX'],
  },
};

// No glow pane, no title (2026-09-16) — a portfolio-summary usage that
// supports a balance figure sitting above it, rather than a standalone
// asset-detail chart with its own directional glow.
export const Quiet: Story = {
  args: {
    series: PLACEHOLDER_SERIES,
    periods: ['1M', 'YTD', 'MAX'],
    hidePeriodSelector: true,
    bleedHeight: 120,
    quiet: true,
  },
};
