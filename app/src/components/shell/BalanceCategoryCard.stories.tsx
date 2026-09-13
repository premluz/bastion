import type { Meta, StoryObj } from '@storybook/react-vite';
import { BalanceCategoryCard } from './BalanceCategoryCard';

const meta: Meta<typeof BalanceCategoryCard> = { title: 'Shell/BalanceCategoryCard', component: BalanceCategoryCard };
export default meta;
type Story = StoryObj<typeof BalanceCategoryCard>;

export const Up: Story = { args: { label: 'Crypto', value: 2244, changeAbs: 75.46, changePercent: 1.41 } };
export const Down: Story = { args: { label: 'Money', value: 812.4, changeAbs: -12.3, changePercent: -1.49 } };
