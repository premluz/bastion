import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileShellPreview } from './MobileShellPreview';
import { TabBar } from './TabBar';

const meta: Meta<typeof TabBar> = {
  title: 'Shell/TabBar',
  component: TabBar,
  globals: { theme: 'safe-one' },
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Safe-one shell preview. Destination labels and expandable composer are provisional (§10.8–10). Microphone and asset search are disabled. All messages stay in story-local state.' } },
  },
  render: () => <MobileShellPreview />,
};
export default meta;
type Story = StoryObj<typeof TabBar>;

export const Idle: Story = {};
export const ComposerOpen: Story = { render: () => <MobileShellPreview initialMode="composer" /> };
export const Conversation: Story = {
  render: () => <MobileShellPreview initialMode="conversation" initialMessages={['Show my holdings.']} />,
};
export const LongTranscript: Story = {
  render: () => <MobileShellPreview initialMode="composer" initialMessages={[
    'Show my holdings.',
    'Compare my watched assets over the past week and show the changes in each position.',
    ...Array.from({ length: 12 }, (_, index) => `Preview message ${index + 1}: keep the transcript scrollable while the controls stay reachable.`),
  ]} />,
};
