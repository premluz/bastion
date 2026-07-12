import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusTag } from './StatusTag';

const meta: Meta<typeof StatusTag> = {
  title: 'Nodes/StatusTag',
  component: StatusTag,
};
export default meta;
type Story = StoryObj<typeof StatusTag>;

export const Happy: Story = {
  args: { label: 'Clean', tone: 'ok' },
};

export const Partial: Story = {
  args: { label: 'Renewal pending (12 days)', tone: 'warn' },
};

export const Empty: Story = {
  args: { label: 'Unrated', tone: 'neutral' },
};
