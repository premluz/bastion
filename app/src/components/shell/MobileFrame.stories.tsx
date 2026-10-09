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
// Agent-first home (2026-10-09): assistant suggestions instead of the coin
// list, and a sleeping orb dock that wakes in place.
export const AgentHome: Story = { args: { homeVariant: 'agent' } };
export const ClassicNavigation: Story = { args: { navigationVariant: 'classic' } };
export const BuyEth: Story = { args: { initialPurchaseQuery: 'I want to buy ETH for $800.' } };
export const AccountMenu: Story = { args: { initialAccountView: 'menu' } };
export const YourAccounts: Story = { args: { initialAccountView: 'accounts' } };
export const EditAccount: Story = { args: { initialAccountView: 'edit' } };
export const AddAccount: Story = { args: { initialAccountView: 'add' } };
export const History: Story = { args: { initialAccountView: 'history' } };

// Entry-state variants, not page variants — each opens the shell in one of
// its three assistant modes so the composer/conversation transitions are
// reachable directly instead of only by clicking through.
export const ComposerOpen: Story = { args: { initialMode: 'composer' } };

export const ConversationMode: Story = {
  args: { initialMode: 'conversation', initialMessages: ['Show my holdings.'] },
};

export const SendToDaniel: Story = { args: { initialMode: 'composer', initialMessages: ['Send $50 to Daniel for coffee'] } };
export const SendToDanielOverlay: Story = { args: { initialMode: 'composer', initialMessages: ['Send $50 to Daniel for coffee'], sendPresentation: 'overlay' } };
