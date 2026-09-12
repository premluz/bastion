import type { Meta, StoryObj } from '@storybook/react-vite';
import { MobileFrame } from './MobileFrame';

// The mobile counterpart to Merlin's Shell/Frame story: the whole app shell,
// not a page gallery. Pages (Home/Assets today, Markets/Trade/Assets later)
// are reached by tapping the TabBar inside the rendered canvas, the same way
// Merlin's Discover is reached by clicking its nav inside Shell/Frame —
// deliberately NOT standalone per-page stories.
//
// Theme comes from the toolbar's own global (see .storybook/preview.ts's
// decorator, which sets data-theme from context.globals.theme). No story here
// pins `globals.theme`: pinning it at meta level locks the toolbar selector
// for that story, which is what previously made the theme switcher look
// disabled.
const meta: Meta<typeof MobileFrame> = {
  title: 'Shell/MobileFrame',
  component: MobileFrame,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof MobileFrame>;

export const Default: Story = {};

// Entry-state variants, not page variants — each opens the shell in one of
// its three assistant modes so the composer/conversation transitions are
// reachable directly instead of only by clicking through.
export const ComposerOpen: Story = { args: { initialMode: 'composer' } };

export const ConversationMode: Story = {
  args: { initialMode: 'conversation', initialMessages: ['Show my holdings.'] },
};
