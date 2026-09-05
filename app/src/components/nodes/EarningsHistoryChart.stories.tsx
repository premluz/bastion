import type { Meta, StoryObj } from '@storybook/react-vite';
import { EarningsHistoryChart } from './EarningsHistoryChart';

const meta: Meta<typeof EarningsHistoryChart> = {
  title: 'Nodes/EarningsHistoryChart',
  component: EarningsHistoryChart,
  decorators: [(Story) => <div style={{ width: '480px' }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof EarningsHistoryChart>;

// Literal-prop node: content drawn from the real South Bow Corp fixture
// (universe/fixtures/equity-example.json) for authenticity. Fixed-width
// story wrapper (merlin-new-node skill §2): ResponsiveContainer can
// mis-measure inside the screenshot pipeline specifically, confirmed
// project precedent — component itself stays responsive.
export const Happy: Story = {
  args: {
    title: 'Earnings Trends',
    points: [
      { period: 'Q3 2025', epsActual: 0.61, epsEstimate: 0.58, revenue: 612000000, reportedAt: '2025-11-04' },
      { period: 'Q4 2025', epsActual: 0.64, epsEstimate: 0.63, revenue: 634000000, reportedAt: '2026-02-10' },
      { period: 'Q1 2026', epsActual: 0.66, epsEstimate: 0.65, revenue: 648000000, reportedAt: '2026-05-05' },
      { period: 'Q2 2026', epsActual: 0.67, epsEstimate: 0.64, revenue: 661000000, reportedAt: '2026-07-28' },
    ],
  },
};

// A miss, not just a beat — confirms both directions render legibly, not
// just the flattering case.
export const Partial: Story = {
  args: {
    title: 'Earnings Trends',
    points: [
      { period: 'Q1 2026', epsActual: 0.52, epsEstimate: 0.65, revenue: 590000000, reportedAt: '2026-05-05' },
      { period: 'Q2 2026', epsActual: 0.67, epsEstimate: 0.64, revenue: 661000000, reportedAt: '2026-07-28' },
    ],
  },
};

export const Empty: Story = {
  args: {
    title: 'Earnings Trends',
    points: [],
  },
};
