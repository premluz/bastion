import type { Meta, StoryObj } from '@storybook/react-vite';
import { AssistantOrb } from './AssistantOrb';

const meta = {
  title: 'Shell/AssistantOrb',
  component: AssistantOrb,
  parameters: { layout: 'centered' },
  args: { activity: 'idle', expanded: false },
} satisfies Meta<typeof AssistantOrb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};
export const Listening: Story = { args: { activity: 'listening', expanded: true } };
export const Thinking: Story = { args: { activity: 'thinking', expanded: true } };
