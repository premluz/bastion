import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileFrame } from './MobileFrame';
import { TabBar } from './TabBar';

const meta: Meta<typeof TabBar> = {
  title: 'Shell/TabBar',
  component: TabBar,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Safe-one shell preview. Destination labels and expandable composer are provisional (§10.8–10). Microphone and asset search are disabled. All messages stay in story-local state.' } },
  },
  render: () => <MobileFrame />,
};
export default meta;
type Story = StoryObj<typeof TabBar>;

export const Idle: Story = {};
export const ComposerOpen: Story = { render: () => <MobileFrame initialMode="composer" /> };
export const Conversation: Story = {
  render: () => <MobileFrame initialMode="conversation" initialMessages={['Show my holdings.']} />,
};
export const LongTranscript: Story = {
  render: () => <MobileFrame initialMode="composer" initialMessages={[
    'Show my holdings.',
    'Compare my watched assets over the past week and show the changes in each position.',
    ...Array.from({ length: 12 }, (_, index) => `Preview message ${index + 1}: keep the transcript scrollable while the controls stay reachable.`),
  ]} />,
};
