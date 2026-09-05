import type { Meta, StoryObj } from '@storybook/react-vite';
import { RiskReturnScatter } from './RiskReturnScatter';

const meta: Meta<typeof RiskReturnScatter> = {
  title: 'Nodes/RiskReturnScatter',
  component: RiskReturnScatter,
  decorators: [(Story) => <div style={{ width: 480 }}>{Story()}</div>],
};
export default meta;
type Story = StoryObj<typeof RiskReturnScatter>;

// Zenith Protocol vs. its two governance-token peers (Phase 21 follow-up,
// scenes/hottest-crypto-week-refine-refine.scene.json) — 7D return vs. volume,
// Zenith highlighted as the subject.
export const Happy: Story = {
  args: {
    title: 'Return vs. volume',
    xAxisLabel: 'Volume',
    yAxisLabel: '7D Return',
    subjectEntityId: 'zenith-protocol',
    data: {
      kind: 'scatter',
      points: [
        { label: 'ZNTH', x: 82, y: 41, entityId: 'zenith-protocol' },
        { label: 'Aurion', x: 24, y: 6, entityId: 'aurion-governance' },
        { label: 'Brightlane', x: 38, y: 10, entityId: 'brightlane-dao' },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    title: 'Return vs. volume',
    xAxisLabel: 'Volume',
    yAxisLabel: '7D Return',
    subjectEntityId: 'zenith-protocol',
    data: {
      kind: 'scatter',
      points: [{ label: 'ZNTH', x: 82, y: 41, entityId: 'zenith-protocol' }],
    },
  },
};

export const Empty: Story = {
  args: {
    title: 'Return vs. volume',
    xAxisLabel: 'Volume',
    yAxisLabel: '7D Return',
    data: { kind: 'scatter', points: [] },
  },
};
