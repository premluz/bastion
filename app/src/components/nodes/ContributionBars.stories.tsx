import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContributionBars } from './ContributionBars';

const meta: Meta<typeof ContributionBars> = {
  title: 'Nodes/ContributionBars',
  component: ContributionBars,
  decorators: [(Story) => <div style={{ width: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof ContributionBars>;

// Zenith Protocol's real 41.03% weekly move (Phase 21 follow-up,
// scenes/zenith-weekly-move.scene.json) — ranked drivers, largest first.
export const Happy: Story = {
  args: {
    title: 'What drove the move',
    data: {
      kind: 'series',
      series: [
        {
          id: 'contribution',
          label: 'Contribution',
          points: [
            { x: 'Governance / Buyback', y: 18 },
            { x: 'Volume expansion', y: 12 },
            { x: 'Staking growth', y: 7 },
            { x: 'Broader market', y: 4 },
          ],
        },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'What drove the move',
    data: {
      kind: 'series',
      series: [
        {
          id: 'contribution',
          label: 'Contribution',
          points: [{ x: 'Governance / Buyback', y: 18 }],
        },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'What drove the move',
    data: { kind: 'series', series: [{ id: 'contribution', label: 'Contribution', points: [] }] },
  },
};
