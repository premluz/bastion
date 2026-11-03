import type { Meta, StoryObj } from '@storybook/react-vite';
import { PaymentCard } from './PaymentCard';
const meta: Meta<typeof PaymentCard> = { title: 'Nodes/PaymentCard', component: PaymentCard,
  globals: { theme: 'safe-one' }, args: { title: 'Transfer to Daniel Smith', to: { name: 'Daniel Smith' }, amount: '50.00', purpose: 'Coffee',
    details: [{ label: 'Arrives', value: 'Instantly' }, { label: 'Network fee', value: '$0.08' }], balance: '$62.00',
    note: '', error: '', mode: 'review' } };
export default meta;
type Story = StoryObj<typeof PaymentCard>;
export const Review: Story = {};
export const Editing: Story = { args: { mode: 'editing' } };
export const Insufficient: Story = { args: { mode: 'editing', amount: '70.00', error: 'Your main balance must cover the amount and the $0.08 fee.' } };
export const Sent: Story = { args: { title: 'Transfer to Daniel Smith', mode: 'sent', balance: '$11.92' } };
const inlineArgs = { presentation: 'inline' as const, title: 'Transfer to Daniel Jones', to: { name: 'Daniel Jones' } };
export const InlineConfirm: Story = { args: inlineArgs };
export const InlinePending: Story = { args: { ...inlineArgs, mode: 'sending' } };
export const InlineResult: Story = { args: { ...inlineArgs, mode: 'sent', balance: '$11.92' } };
// Between the user's own accounts (2026-10-31): their icons between the chevrons, then the amount; no network fee.
const ownArgs = { presentation: 'inline' as const, title: 'Top up Mortgage account', amount: '190.00', purpose: 'Today’s repayment', balance: '$3,475.45',
  from: { name: 'Money', icon: 'wallet' as const }, to: { name: 'Mortgage', icon: 'house' as const } };
export const OwnAccounts: Story = { args: ownArgs };
export const OwnAccountsFromUsdc: Story = { args: { ...ownArgs, from: { name: 'USDC', icon: 'coin' },
  details: [{ label: 'Conversion', value: '190 USDC → $190.00 · no fee' }] } };
export const OwnAccountsResult: Story = { args: { ...ownArgs, mode: 'sent' } };
// Optional captions under each end, rolling to an outcome once the transfer lands: kept in the component, unused by any flow now.
const captioned = { ...ownArgs, from: { ...ownArgs.from, caption: '$3,475.45 → $3,285.45', outcome: '$3,285.45' },
  to: { ...ownArgs.to, caption: '$190 short → Fully covered', outcome: 'Fully covered' } };
export const OwnAccountsCaptioned: Story = { args: captioned };
