import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetricGrid } from './MetricGrid';
import { Metric } from './Metric';

const meta: Meta<typeof MetricGrid> = {
  title: 'Nodes/MetricGrid',
  component: MetricGrid,
};
export default meta;
type Story = StoryObj<typeof MetricGrid>;

export const Happy: Story = {
  args: {
    children: (
      <>
        <Metric label="Candidates above 6%" value={3} unit="assets" />
        <Metric label="Reference — NordBond 2029" value="5.8%" detail="Below threshold" />
        <Metric label="Highest yield" value="9.1%" detail="Helios Yield Fund" />
      </>
    ),
  },
};

export const Partial: Story = {
  args: {
    children: <Metric label="Candidates above 6%" value={3} unit="assets" />,
  },
};

export const Empty: Story = {
  args: { children: undefined },
};
