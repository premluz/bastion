import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { DashboardLayout } from './DashboardLayout';

const meta: Meta<typeof DashboardLayout> = {
  title: 'Nodes/DashboardLayout',
  component: DashboardLayout,
};
export default meta;
type Story = StoryObj<typeof DashboardLayout>;

// DashboardLayout's own job is arrangement, not content (node-vocabulary.md
// — "if you notice it, it failed") — placeholder cards demonstrate the
// span mechanics cleanly, same as scene-grid's own bare-card stories.
// columns/spans are passed as story args, bypassing the registry
// entirely (same as every other node's story) — the gate's "renders
// correctly at 2/3/4 configured columns" requirement, since scene JSON
// itself can never drive this (Prem's instruction, decoupled from the
// scene contract).
function placeholderCards(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <Card key={index} variant="default" padding={4}>
      <Text type="label" display="block">
        Card {index + 1}
      </Text>
    </Card>
  ));
}

export const TwoColumns: Story = {
  args: { columns: 2, spans: ['full', 1, 1, 1], children: placeholderCards(4) },
};

export const ThreeColumns: Story = {
  args: { columns: 3, spans: ['full', 'full', 1, 1, 1, 2, 1], children: placeholderCards(7) },
};

export const FourColumns: Story = {
  args: { columns: 4, spans: ['full', 2, 1, 1, 4], children: placeholderCards(5) },
};
