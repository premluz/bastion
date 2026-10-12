import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletCardTile } from './WalletCardTile';

const meta: Meta<typeof WalletCardTile> = { title: 'Shell/WalletCardTile', component: WalletCardTile };
export default meta;
type Story = StoryObj<typeof WalletCardTile>;
export const Prototype: Story = {};
export const Wired: Story = { args: { onManage: () => undefined } };
