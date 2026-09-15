import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoneyPage, type WalletTab } from './MoneyPage';

const meta: Meta<typeof MoneyPage> = { title: 'Shell/MoneyPage', component: MoneyPage };
export default meta;
type Story = StoryObj<typeof MoneyPage>;

function MoneyPageHarness({ initialTab = 'money' as WalletTab }) {
  const [tab, setTab] = useState<WalletTab>(initialTab);
  return <MoneyPage tab={tab} onTabChange={setTab} />;
}

export const Default: Story = { render: () => <MoneyPageHarness /> };
export const CryptoTab: Story = { render: () => <MoneyPageHarness initialTab="crypto" /> };
