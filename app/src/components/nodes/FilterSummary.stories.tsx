import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterSummary } from './FilterSummary';

const meta: Meta<typeof FilterSummary> = {
  title: 'Nodes/FilterSummary',
  component: FilterSummary,
};
export default meta;
type Story = StoryObj<typeof FilterSummary>;

export const Happy: Story = {
  args: { constraints: ['EU-regulated', 'Yield > 6%', '≥ €50M outstanding', 'Conservative mandate'] },
};

export const Partial: Story = {
  args: { constraints: ['EU-regulated'] },
};

export const Empty: Story = {
  args: { constraints: ['No active constraints'] },
};
