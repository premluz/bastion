import type { Meta, StoryObj } from '@storybook/react-vite';
import { Sparkline } from './Sparkline';

const meta: Meta<typeof Sparkline> = {
  title: 'Nodes/Sparkline',
  component: Sparkline,
};
export default meta;
type Story = StoryObj<typeof Sparkline>;

// Aldergate's real yield trend, thinned to endpoints + shape.
export const Happy: Story = {
  args: {
    points: [
      { x: '2026-04-09', y: 6.9 },
      { x: '2026-05-01', y: 7.0 },
      { x: '2026-05-15', y: 7.1 },
      { x: '2026-06-01', y: 7.0 },
      { x: '2026-06-18', y: 7.2 },
      { x: '2026-07-02', y: 7.2 },
    ],
  },
};

// Two points is the minimum viable trend — anything less renders nothing.
export const Partial: Story = {
  args: {
    points: [
      { x: '2026-06-25', y: 7.1 },
      { x: '2026-07-02', y: 7.2 },
    ],
  },
};

// Fewer than 2 points — deliberately renders nothing, not an EmptyState
// card (node-vocabulary.md: this is an inline glyph, not a full node).
export const Empty: Story = {
  args: { points: [] },
};

export const CardGradient: Story = { args: { ...Happy.args, variant: 'block' } };
