import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletCardTile } from './WalletCardTile';
import { WALLET_CARDS } from './cardData';

const meta: Meta<typeof WalletCardTile> = { title: 'Shell/WalletCardTile', component: WalletCardTile };
export default meta;
type Story = StoryObj<typeof WalletCardTile>;
export const Metal: Story = { args: { card: WALLET_CARDS[0]! } };
export const Virtual: Story = { args: { card: WALLET_CARDS[1]! } };
