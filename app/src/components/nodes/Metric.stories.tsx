import type { Meta, StoryObj } from '@storybook/react-vite';
import { Metric } from './Metric';

const meta: Meta<typeof Metric> = {
  title: 'Nodes/Metric',
  component: Metric,
};
export default meta;
type Story = StoryObj<typeof Metric>;

export const Happy: Story = {
  args: {
    label: 'Highest yield',
    value: '9.1%',
    detail: 'Helios Yield Fund',
    trend: [
      { x: '2026-04-09', y: 8.6 },
      { x: '2026-05-15', y: 8.8 },
      { x: '2026-06-01', y: 9.0 },
      { x: '2026-06-18', y: 9.0 },
      { x: '2026-07-02', y: 9.1 },
    ],
  },
};

export const Partial: Story = {
  args: { label: 'Candidates above 6%', value: 3, unit: 'assets' },
};

export const Empty: Story = {
  args: { label: 'RiskLens score', value: '—', detail: 'Not yet scored' },
};
