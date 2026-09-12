import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConversationModeOverlay } from './ConversationModeOverlay';
import { MobileFrame } from './MobileFrame';

const meta: Meta<typeof ConversationModeOverlay> = {
  title: 'Shell/ConversationModeOverlay',
  component: ConversationModeOverlay,
  parameters: { layout: 'fullscreen' },
  render: () => <MobileFrame initialMode="conversation" initialMessages={['Show my holdings.']} />,
};
export default meta;
type Story = StoryObj<typeof ConversationModeOverlay>;
export const Listening: Story = {};
