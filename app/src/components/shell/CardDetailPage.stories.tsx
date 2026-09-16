import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardDetailPage } from './CardDetailPage';
import { WALLET_CARDS } from './cardData';

// A real DOMRect for the "sourceRect" the deck would normally measure at
// tap time — an arbitrary plausible on-screen position/size for a story
// context with no live deck to tap.
const SOURCE_RECT = new DOMRect(40, 480, 280, 176);

const meta: Meta<typeof CardDetailPage> = { title: 'Shell/CardDetailPage', component: CardDetailPage };
export default meta;
type Story = StoryObj<typeof CardDetailPage>;

export const Default: Story = { args: { card: WALLET_CARDS[0]!, sourceRect: SOURCE_RECT, onClose: () => {} } };
