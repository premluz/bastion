import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfidenceMeter } from './ConfidenceMeter';

const meta: Meta<typeof ConfidenceMeter> = {
  title: 'Nodes/ConfidenceMeter',
  component: ConfidenceMeter,
};
export default meta;
type Story = StoryObj<typeof ConfidenceMeter>;

// Literal-prop node: "Happy/Partial/Empty" are representative value
// variations, not missing-data states (no bind, same convention as
// StatusTag's three stories).
export const Happy: Story = {
  args: { label: 'History confidence', value: 0.86 },
};

export const Partial: Story = {
  args: { label: 'Forward-looking confidence', value: 0.58 },
};

export const Empty: Story = {
  args: { label: 'Motive read', value: 0.32 },
};
