import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import type { WalletCard } from './cardData';
import styles from './WalletCardTile.module.css';

export interface WalletCardTileProps { card: WalletCard }

// The active card's name/cashback badge/Manage row, rendered once beneath
// the deck (2026-09-16). This reverses the prior day's arrangement, where
// the row travelled inside each carousel slide — that was correct for a
// flat scroll-snap carousel, where every slide was fully visible in turn,
// but the deck the reference specifies keeps rear cards mostly hidden
// behind the front one, so a row nested per-slide would be invisible for
// every card except the front. CardDeck renders this for whichever card
// is currently in front instead.
//
// Card art itself is VirtualCardPlaceholder, now passed straight into the
// deck rather than wrapped here: the deck stacks and transforms the art,
// and this row must stay still while the cards move behind it.
export function WalletCardTile({ card }: WalletCardTileProps) {
  return (
    <div className={styles.meta}>
      <Text type="body" weight="semibold">{card.name}</Text>
      <span className={styles.badge}>
        <Text type="supporting" weight="semibold" className={styles.badgeText}>{card.cashbackPercent}% mUSD back</Text>
      </span>
      <Button label="Manage" variant="secondary" size="sm" className={styles.manageButton} />
    </div>
  );
}
