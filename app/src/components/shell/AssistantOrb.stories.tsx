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

// Only the morphing shader, as a soft circle of light (2026-10-10): no ring, disc or clip.
export const Unbounded: Story = { args: { variant: 'unbounded' }, parameters: { layout: 'fullscreen' } };
