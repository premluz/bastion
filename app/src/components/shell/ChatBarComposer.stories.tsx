import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatBarComposer } from './ChatBarComposer';
import { MobileShellPreview } from './MobileShellPreview';

const meta: Meta<typeof ChatBarComposer> = {
  title: 'Shell/ChatBarComposer',
  component: ChatBarComposer,
  globals: { theme: 'safe-one' },
  parameters: { layout: 'fullscreen' },
  render: () => <MobileShellPreview initialMode="composer" />,
};
export default meta;
type Story = StoryObj<typeof ChatBarComposer>;
export const LocalSubmission: Story = {};
