import type { Meta, StoryObj } from '@storybook/react-vite';
import { RingGauge } from './RingGauge';

const meta: Meta<typeof RingGauge> = {
  title: 'Nodes/RingGauge',
  component: RingGauge,
};
export default meta;
type Story = StoryObj<typeof RingGauge>;

// Literal-prop node: "Happy/Partial/Empty" are representative value
// variations, not missing-data states (no bind, same convention as
// ConfidenceMeter/SceneSummary's own stories) — content drawn from the
// real risk-desk-dashboard fixture for authenticity.
export const Happy: Story = {
  args: {
    label: 'Risk limit utilization',
    value: 21,
    max: 25,
    unit: '€M',
    tone: 'warn',
  },
};

export const Partial: Story = {
  args: {
    label: 'Risk limit utilization',
    value: 8,
    max: 25,
    unit: '€M',
    tone: 'ok',
  },
};

export const Empty: Story = {
  args: {
    label: 'Risk limit utilization',
    value: 0,
    max: 25,
    unit: '€M',
    tone: 'ok',
  },
};
