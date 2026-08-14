import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThinkingIndicator } from './ThinkingIndicator';

const meta: Meta<typeof ThinkingIndicator> = {
  title: 'Trail/ThinkingIndicator',
  component: ThinkingIndicator,
};
export default meta;
type Story = StoryObj<typeof ThinkingIndicator>;

export const Default: Story = {};
