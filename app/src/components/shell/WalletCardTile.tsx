import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { VirtualCardPlaceholder } from './VirtualCardPlaceholder';
import type { WalletCard } from './cardData';
import styles from './WalletCardTile.module.css';

export interface WalletCardTileProps { card: WalletCard }

// Wraps VirtualCardPlaceholder with its own name/cashback badge/Manage
// row (2026-09-15, direct feedback: these details "are below each card
// as part of carousel... card component is its own but we need another
// one that wraps card content and these details" — the meta row had been
// rendered separately below the whole carousel, once per card regardless
// of which one was active, instead of travelling with its own card as one
// slide). VirtualCardPlaceholder itself stays the pure card-art
// component; this is the per-slide composition PromoCarousel renders.
export function WalletCardTile({ card }: WalletCardTileProps) {
  return (
    <div className={styles.root}>
      <VirtualCardPlaceholder lastFourDigits={card.lastFourDigits} />
      <div className={styles.meta}>
        <Text type="body" weight="semibold">{card.name}</Text>
        <span className={styles.badge}>
          <Text type="supporting" weight="semibold" className={styles.badgeText}>{card.cashbackPercent}% mUSD back</Text>
        </span>
        <Button label="Manage" variant="secondary" size="sm" className={styles.manageButton} />
      </div>
    </div>
  );
}
