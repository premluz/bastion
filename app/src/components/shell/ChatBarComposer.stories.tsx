import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatBarComposer } from './ChatBarComposer';
import { MobileFrame } from './MobileFrame';

const meta: Meta<typeof ChatBarComposer> = {
  title: 'Shell/ChatBarComposer',
  component: ChatBarComposer,
  parameters: { layout: 'fullscreen' },
  render: () => <MobileFrame initialMode="composer" />,
};
export default meta;
type Story = StoryObj<typeof ChatBarComposer>;
export const LocalSubmission: Story = {};
