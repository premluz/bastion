import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import styles from './PromoCardFull.module.css';

interface PromoCardFullProps {
  title: string;
  icon?: string;
}

// One-at-a-time promo variant (2026-09-15, direct feedback: "make a
// variant of offers carousel that is only one rectangle in view and dots
// to navigate, at once full rectangle... and image on right (square
// proportions) so it's flatter than current") — a distinct component
// from PromoCard.tsx, not a prop flag on it: the layout inverts (text
// left + square art right, vs. PromoCard's stacked full-width art over
// text) and the card is shorter/flatter, closer to a banner than a tile.
// Meant for PromoCarousel.tsx's one-card-at-a-time + dots track;
// PromoCard/Carousel's existing 2.5-visible layout is untouched.
//
// Same "no fabricated imagery" posture as PromoCard.tsx: a token-surfaced
// square stands in unless an icon (a single emoji) is supplied.
export function PromoCardFull({ title, icon }: PromoCardFullProps) {
  return (
    <Card className={`${styles.root} panelFlat`} padding={0}>
      <Text type="label" weight="semibold" className={styles.body}>
        {title}
      </Text>
      <div className={styles.art} aria-hidden="true">
        {icon}
      </div>
    </Card>
  );
}
