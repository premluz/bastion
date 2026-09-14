import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoneyPage } from './MoneyPage';

const meta: Meta<typeof MoneyPage> = { title: 'Shell/MoneyPage', component: MoneyPage };
export default meta;
type Story = StoryObj<typeof MoneyPage>;
export const Default: Story = { args: { onBack: () => {} } };
