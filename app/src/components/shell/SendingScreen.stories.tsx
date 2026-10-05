import type { Meta, StoryObj } from '@storybook/react-vite';
import { SendingScreen } from './SendingScreen';

const meta: Meta<typeof SendingScreen> = {
  title: 'Shell/SendingScreen',
  component: SendingScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    amount: '$50.00',
    sender: { name: 'Preview user', src: '/avatars/me.png' },
    recipient: { name: 'Daniel Jones' },
    onCancel: () => undefined,
    onDone: () => undefined,
  },
};
export default meta;
type Story = StoryObj<typeof SendingScreen>;
export const Processing: Story = { args: { phase: 'processing' } };
export const Success: Story = { args: { phase: 'success' } };
