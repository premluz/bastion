import type { Meta, StoryObj } from '@storybook/react-vite';
import { AllocationBar } from './AllocationBar';

const meta: Meta<typeof AllocationBar> = { title: 'Shell/AllocationBar', component: AllocationBar };
export default meta;
type Story = StoryObj<typeof AllocationBar>;

export const Default: Story = {
  args: {
    segments: [
      { id: 'eth', label: 'ETH', value: 2849.56 },
      { id: 'sol', label: 'SOL', value: 1130.96 },
      { id: 'usdc', label: 'USDC', value: 950 },
      { id: 'usdt', label: 'USDT', value: 400 },
      { id: 'gala', label: 'GALA', value: 136.5 },
    ],
  },
};
