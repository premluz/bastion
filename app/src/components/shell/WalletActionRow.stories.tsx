import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletActionRow } from './WalletActionRow';

// shape is independent of variant (2026-09-16, direct feedback: "2
// variants that can be configured per instance, not each instance has
// different like now") — exposed as its own control so either action set
// can use either shape, rather than one shape being implicitly tied to
// one variant.
const meta: Meta<typeof WalletActionRow> = {
  title: 'Shell/WalletActionRow',
  component: WalletActionRow,
  argTypes: {
    shape: { control: 'radio', options: ['roundedSquare', 'circle'] },
    size: { control: 'radio', options: ['default', 'compact'] },
  },
};
export default meta;
type Story = StoryObj<typeof WalletActionRow>;
export const RoundedSquare: Story = { args: { shape: 'roundedSquare' } };
export const Circle: Story = { args: { shape: 'circle' } };
export const Money: Story = { args: { variant: 'money', shape: 'circle' } };
export const MoneyRoundedSquare: Story = { args: { variant: 'money', shape: 'roundedSquare' } };
export const Card: Story = { args: { variant: 'card', shape: 'circle' } };
export const Compact: Story = { args: { shape: 'circle', size: 'compact' } };
