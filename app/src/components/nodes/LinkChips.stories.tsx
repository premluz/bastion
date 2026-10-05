import type { Meta, StoryObj } from '@storybook/react-vite';
import { LinkChips } from './LinkChips';
const meta: Meta<typeof LinkChips> = { title: 'Nodes/LinkChips', component: LinkChips, globals: { theme: 'safe-one' },
  args: { label: 'Market lists', variant: 'chips', links: ['Blue Chips', 'DeFi', 'HyperEVM', 'Top Volume', 'Memes', 'Z500']
    .map((label) => ({ id: label, label, href: `#${label.replaceAll(' ', '-')}` })) } };
export default meta;
type Story = StoryObj<typeof LinkChips>;
export const Lists: Story = {};
export const Categories: Story = { args: { label: 'Explore categories', variant: 'tabs', active: 'All',
  links: ['All', 'Crypto', 'Stocks', 'Perps', 'Commodities'].map((label) => ({ id: label, label, href: `#${label}` })) } };
