import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimeSeries } from './TimeSeries';

const meta: Meta<typeof TimeSeries> = {
  title: 'Nodes/TimeSeries',
  component: TimeSeries,
  // Fixed pixel width, not the component's default 100%: recharts'
  // ResponsiveContainer measures via ResizeObserver, and a percentage
  // width can be caught by Playwright's screenshot-time reflow mid
  // re-measure (line drawn to a stale narrower width than the axis).
  // A fixed-width ancestor removes the race for baseline capture; the
  // component itself stays responsive for real panel layouts.
  decorators: [(Story) => <div style={{ width: 640 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof TimeSeries>;

// Phase 8E craft pass: title finally renders (long-standing gap, Sixth
// promotion review ruling), reference line + annotation demonstrated
// together — a threshold (context) and a named event (fact) read
// differently, per the vocabulary's registers.
export const Happy: Story = {
  args: {
    title: 'Aldergate Estates — yield & volatility',
    referenceLines: [{ value: 7.0, label: 'Target yield' }],
    annotations: [{ x: '2026-06-18', label: 'Rate review' }],
    data: {
      kind: 'series',
      series: [
        {
          id: 'yield',
          label: 'Yield (%)',
          points: [
            { x: '2026-06-04', y: 7.2 },
            { x: '2026-06-11', y: 7.1 },
            { x: '2026-06-18', y: 7.2 },
            { x: '2026-06-25', y: 7.2 },
            { x: '2026-07-02', y: 7.2 },
          ],
        },
        {
          id: 'volatility',
          label: 'Volatility (%)',
          points: [
            { x: '2026-06-04', y: 3.0 },
            { x: '2026-06-11', y: 2.9 },
            { x: '2026-06-18', y: 3.1 },
            { x: '2026-06-25', y: 2.8 },
            { x: '2026-07-02', y: 3.0 },
          ],
        },
      ],
    },
  },
};

// The combo variant — bars for every series, primary series overlaid as
// a line — using settlement-anomaly's real volume shape and its two real
// failure-date annotations.
export const Combo: Story = {
  args: {
    title: 'MarketTape volume, 10-day window',
    variant: 'combo',
    annotations: [
      { x: '2026-07-06', label: 'Settlement failed' },
      { x: '2026-07-08', label: 'Settlement failed' },
    ],
    data: {
      kind: 'series',
      series: [
        {
          id: 'volume',
          label: 'Volume (€M notional)',
          points: [
            { x: '2026-06-29', y: 12 },
            { x: '2026-06-30', y: 14 },
            { x: '2026-07-01', y: 13 },
            { x: '2026-07-02', y: 22 },
            { x: '2026-07-03', y: 15 },
            { x: '2026-07-04', y: 28 },
            { x: '2026-07-05', y: 34 },
            { x: '2026-07-06', y: 18 },
            { x: '2026-07-07', y: 30 },
            { x: '2026-07-08', y: 16 },
          ],
        },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Aldergate Estates — yield',
    data: {
      kind: 'series',
      series: [
        {
          id: 'yield',
          label: 'Yield (%)',
          points: [
            { x: '2026-06-25', y: 7.2 },
            { x: '2026-07-02', y: 7.2 },
          ],
        },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'Aldergate Estates — yield',
    data: { kind: 'series', series: [{ id: 'yield', label: 'Yield (%)', points: [] }] },
  },
};
