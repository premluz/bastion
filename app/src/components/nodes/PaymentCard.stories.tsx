import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaymentCard } from './PaymentCard';
const meta: Meta<typeof PaymentCard> = { title: 'Nodes/PaymentCard', component: PaymentCard,
  globals: { theme: 'safe-one' }, args: { title: 'Transfer to Daniel Smith', recipient: 'Daniel Smith', amount: '50.00', purpose: 'Coffee',
    from: 'Main USDT (after consolidation)', fee: '$0.08', arrival: 'Instantly', balance: '$62.00',
    note: '', error: '', mode: 'review' } };
export default meta;
type Story = StoryObj<typeof PaymentCard>;
export const Review: Story = {};
export const Editing: Story = { args: { mode: 'editing' } };
export const Insufficient: Story = { args: { mode: 'editing', amount: '70.00', error: 'Your main balance must cover the amount and the $0.08 fee.' } };
export const Sent: Story = { args: { title: 'Transfer to Daniel Smith', mode: 'sent', balance: '$11.92' } };
const inlineArgs = { presentation: 'inline' as const, title: 'Transfer to Daniel Jones', recipient: 'Daniel Jones' };
export const InlineConfirm: Story = { args: inlineArgs };
export const VoiceConfirm: Story = { args: { ...inlineArgs, interaction: 'voice' } };
export const InlinePending: Story = { args: { ...inlineArgs, mode: 'sending' } };
export const InlineResult: Story = { args: { ...inlineArgs, mode: 'sent', balance: '$11.92' } };
