import type { Meta, StoryObj } from '@storybook/react-vite';
import { PurchaseDetail } from './PurchaseDetail';

const meta: Meta<typeof PurchaseDetail> = { title: 'Nodes/PurchaseDetail', component: PurchaseDetail,
  args: { label: 'Spend', value: '800.00 USDT', kind: 'amount', confirmed: false } };
export default meta;
type Story = StoryObj<typeof PurchaseDetail>;
export const Amount: Story = {};
export const Fee: Story = { args: { label: 'Network fee', value: 'Included (demo)', kind: 'detail' } };
export const Confirm: Story = { args: { label: 'Confirm Purchase', kind: 'confirm' } };
export const Confirmed: Story = { args: { kind: 'confirm', confirmed: true } };
