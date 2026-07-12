import type { Meta, StoryObj } from '@storybook/react-vite';
import { Recommendation } from './Recommendation';

const meta: Meta<typeof Recommendation> = {
  title: 'Nodes/Recommendation',
  component: Recommendation,
};
export default meta;
type Story = StoryObj<typeof Recommendation>;

export const Happy: Story = {
  args: {
    text: 'Size the Aldergate Estates position, but gate settlement on audit confirmation.',
    confidence: 0.86,
    caveat: 'Confidence drops on the forward view until IssuerRegistry updates the audit status.',
  },
};

export const Partial: Story = {
  args: {
    text: 'Vantara Metals is worth holding as the portfolio diversifier, independent of the yield screen.',
    confidence: 0.62,
  },
};

export const Empty: Story = {
  args: {
    text: 'No recommendation yet — awaiting IssuerRegistry confirmation.',
  },
};
