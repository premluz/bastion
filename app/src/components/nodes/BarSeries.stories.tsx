import type { Meta, StoryObj } from '@storybook/react-vite';
import { BarSeries } from './BarSeries';

const meta: Meta<typeof BarSeries> = {
  title: 'Nodes/BarSeries',
  component: BarSeries,
  decorators: [(Story) => <div style={{ width: 560 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof BarSeries>;

// Aldergate's real 8-quarter distribution record (issuer-dossier).
export const Happy: Story = {
  args: {
    title: 'Distribution record',
    data: {
      kind: 'series',
      series: [
        {
          id: 'distribution',
          label: 'Distribution (€M)',
          points: [
            { x: 'Q3 2024', y: 1.1 },
            { x: 'Q4 2024', y: 1.11 },
            { x: 'Q1 2025', y: 1.12 },
            { x: 'Q2 2025', y: 1.11 },
            { x: 'Q3 2025', y: 1.13 },
            { x: 'Q4 2025', y: 1.12 },
            { x: 'Q1 2026', y: 1.14 },
            { x: 'Q2 2026', y: 1.13 },
          ],
        },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Distribution record',
    data: {
      kind: 'series',
      series: [
        {
          id: 'distribution',
          label: 'Distribution (€M)',
          points: [
            { x: 'Q1 2026', y: 1.14 },
            { x: 'Q2 2026', y: 1.13 },
          ],
        },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'Distribution record',
    data: { kind: 'series', series: [{ id: 'distribution', label: 'Distribution (€M)', points: [] }] },
  },
};
