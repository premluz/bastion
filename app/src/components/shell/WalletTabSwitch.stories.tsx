import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WalletTabSwitch } from './WalletTabSwitch';

const ITEMS = [
  { id: 'money', label: 'Money' },
  { id: 'crypto', label: 'Investments' },
] as const;

function Harness() {
  const [value, setValue] = useState<(typeof ITEMS)[number]['id']>('money');
  return <WalletTabSwitch items={ITEMS} value={value} onChange={setValue} label="Wallet section" />;
}

const meta: Meta<typeof WalletTabSwitch> = { title: 'Shell/WalletTabSwitch', component: WalletTabSwitch };
export default meta;
type Story = StoryObj<typeof WalletTabSwitch>;

export const Default: Story = { render: () => <Harness /> };
