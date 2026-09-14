import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletActionRow } from './WalletActionRow';

const meta: Meta<typeof WalletActionRow> = { title: 'Shell/WalletActionRow', component: WalletActionRow };
export default meta;
type Story = StoryObj<typeof WalletActionRow>;
export const Default: Story = {};
export const Money: Story = { args: { variant: 'money' } };
