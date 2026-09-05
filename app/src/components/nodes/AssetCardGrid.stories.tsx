import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssetCardGrid } from './AssetCardGrid';

const meta: Meta<typeof AssetCardGrid> = {
  title: 'Nodes/AssetCardGrid',
  component: AssetCardGrid,
  decorators: [(Story) => <div style={{ width: '900px' }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AssetCardGrid>;

// Bind node: content drawn from real Discover-page crypto entities (Phase
// 21's own fixture, universe/entities.json) — same reuse discipline every
// other bind-node story in this app follows.
export const Happy: Story = {
  args: {
    data: {
      kind: 'entity-cards',
      entities: [
        { id: 'zenith-protocol', name: 'Zenith Protocol', type: 'DeFi Governance Token', value: '$4.95', deltaPercent: 41.03 },
        { id: 'solent-stablecoin', name: 'Solent Stablecoin', type: 'Stablecoin', value: '$1.02', deltaPercent: 1.81 },
        { id: 'nexus-tech', name: 'Nexus Tech', type: 'Equity — Software & Services', value: '$206.00', deltaPercent: -0.02 },
        { id: 'forge-mining', name: 'Forge Mining', type: 'Equity — Metals & Mining', value: '$43.30', deltaPercent: -0.12 },
      ],
    },
  },
};

export const Partial: Story = {
  args: {
    data: {
      kind: 'entity-cards',
      entities: [{ id: 'zenith-protocol', name: 'Zenith Protocol', type: 'DeFi Governance Token', value: '$4.95', deltaPercent: 41.03 }],
    },
  },
};

export const Empty: Story = {
  args: {
    data: { kind: 'entity-cards', entities: [{ id: 'placeholder', name: 'Placeholder', type: 'Placeholder', value: '—', deltaPercent: 0 }] },
  },
};
