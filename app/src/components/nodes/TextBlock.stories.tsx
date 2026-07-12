import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextBlock } from './TextBlock';

const meta: Meta<typeof TextBlock> = {
  title: 'Nodes/TextBlock',
  component: TextBlock,
};
export default meta;
type Story = StoryObj<typeof TextBlock>;

export const Happy: Story = {
  args: {
    text: "Aldergate's fundamentals are sound and distributions have run unbroken for eight consecutive quarters.\n\nThe single open risk is the pending audit renewal — IssuerRegistry has not yet confirmed the outcome.",
  },
};

export const Partial: Story = {
  args: {
    text: 'Helios carries the highest yield in the screen, but its RiskLens score and retail concentration sit outside the conservative mandate.',
  },
};

export const Empty: Story = {
  args: { text: 'Not yet verified.' },
};
