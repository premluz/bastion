import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from './Panel';

const meta: Meta<typeof Panel> = {
  title: 'Nodes/Panel',
  component: Panel,
};
export default meta;
type Story = StoryObj<typeof Panel>;

export const Happy: Story = {
  args: {
    title: 'Candidates ranked by yield',
    source: 'MarketTape',
    children: <p style={{ color: 'var(--ink-secondary)', margin: 0 }}>Evidence content renders here.</p>,
  },
};

export const Partial: Story = {
  args: {
    title: 'Candidates ranked by yield',
    children: <p style={{ color: 'var(--ink-secondary)', margin: 0 }}>Evidence content renders here.</p>,
  },
};

export const Empty: Story = {
  args: {
    title: 'Candidates ranked by yield',
    children: undefined,
  },
};
