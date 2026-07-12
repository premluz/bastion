import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfidenceBadge } from './ConfidenceBadge';

const meta: Meta<typeof ConfidenceBadge> = {
  title: 'Trail/ConfidenceBadge',
  component: ConfidenceBadge,
};
export default meta;
type Story = StoryObj<typeof ConfidenceBadge>;

export const High: Story = { args: { confidence: 0.88 } };
export const Moderate: Story = { args: { confidence: 0.62 } };
export const Low: Story = { args: { confidence: 0.35 } };
