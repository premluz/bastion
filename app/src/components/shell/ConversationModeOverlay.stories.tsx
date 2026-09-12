import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConversationModeOverlay } from './ConversationModeOverlay';
import { MobileShellPreview } from './MobileShellPreview';

const meta: Meta<typeof ConversationModeOverlay> = {
  title: 'Shell/ConversationModeOverlay',
  component: ConversationModeOverlay,
  globals: { theme: 'safe-one' },
  parameters: { layout: 'fullscreen' },
  render: () => <MobileShellPreview initialMode="conversation" initialMessages={['Show my holdings.']} />,
};
export default meta;
type Story = StoryObj<typeof ConversationModeOverlay>;
export const Listening: Story = {};
