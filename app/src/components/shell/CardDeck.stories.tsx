import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardDeck } from './CardDeck';
import { VirtualCardPlaceholder } from './VirtualCardPlaceholder';
import { WalletCardTile } from './WalletCardTile';
import { WALLET_CARDS } from './cardData';

const meta: Meta<typeof CardDeck> = { title: 'Shell/CardDeck', component: CardDeck };
export default meta;
type Story = StoryObj<typeof CardDeck>;

export const Default: Story = {
  args: {
    'aria-label': 'Cards',
    renderDetails: (activeIndex: number) => <WalletCardTile card={WALLET_CARDS[activeIndex]!} />,
    children: WALLET_CARDS.map((card) => (
      <VirtualCardPlaceholder key={card.id} lastFourDigits={card.lastFourDigits} />
    )),
  },
};

// Two cards only — the spec's "if there are only two cards, avoid a fake
// third-card layer" case, so the deck shows exactly the real deck depth.
export const TwoCards: Story = {
  args: {
    'aria-label': 'Cards',
    renderDetails: (activeIndex: number) => <WalletCardTile card={WALLET_CARDS[activeIndex]!} />,
    children: WALLET_CARDS.slice(0, 2).map((card) => (
      <VirtualCardPlaceholder key={card.id} lastFourDigits={card.lastFourDigits} />
    )),
  },
};
