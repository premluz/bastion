import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssetRow } from './AssetRow';
const meta: Meta<typeof AssetRow> = { title: 'Nodes/AssetRow', component: AssetRow, globals: { theme: 'safe-one' },
  args: { variant: 'owned', entityId: 'eth', name: 'Ethereum', symbol: 'ETH', value: '$2,684.56', deltaPercent: 2.31,
    quantity: '1', marketCap: '', volume: '', selected: false, href: '#eth' } };
export default meta;
type Story = StoryObj<typeof AssetRow>;
export const Owned: Story = {};
export const Market: Story = { args: { variant: 'market', marketCap: '$322.4B', volume: '$18.2B' } };
export const LongName: Story = { args: { variant: 'market', name: 'Hewlett Packard Enterprise Company', marketCap: '$83B', volume: '$39M', badge: '10x' } };
