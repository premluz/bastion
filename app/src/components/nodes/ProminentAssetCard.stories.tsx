import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProminentAssetCard } from './ProminentAssetCard';
import { SceneRenderer } from '../../renderer/SceneRenderer';
const meta: Meta<typeof ProminentAssetCard> = { title: 'Nodes/ProminentAssetCard', component: ProminentAssetCard,
  globals: { theme: 'safe-one' }, args: { entityId: 'eth', symbol: 'ETH', variant: 'perp', primary: 'ETH',
    secondary: '$350.73M Vol', badge: '25x', href: '#eth' } };
export default meta;
type Story = StoryObj<typeof ProminentAssetCard>;
export const Perp: Story = {};
export const Earn: Story = { args: { variant: 'earn', primary: '15.36% APY', secondary: 'on ETH', badge: '' } };
export const WithPriceAndSparkline: Story = { args: { price: '$2,684.56', deltaPercent: 2.31 },
  render: (args) => <SceneRenderer scene={{ id: 'prominent-preview', title: 'Perpetual', intents: [], thinking: [], data: {},
    layout: { id: 'card', type: 'prominent-asset-card', props: { ...args }, children: [{ id: 'trend', type: 'sparkline',
      props: { variant: 'block', points: [20, 24, 21, 23, 22, 25, 27, 24, 28, 30, 29, 35, 42].map((y, x) => ({ x: String(x), y })) } }] } }} /> };
