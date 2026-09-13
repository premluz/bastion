import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import styles from './PromoCard.module.css';

interface PromoCardProps {
  title: string;
  icon?: string;
}

// One tile in AssetsHomePage's promo carousel (2026-09-13, direct
// feedback: "below promo cards carousel, above total balance"). No real
// illustration pipeline exists for these — a plain token-surfaced block
// stands in unless an `icon` (a single emoji, matching the reference's own
// gift-box tile) is supplied, same "token-colored placeholder, no
// fabricated imagery" posture this app already holds for other missing-
// asset visuals rather than inventing artwork.
//
// Card, not a bare div (2026-09-13 follow-up, same fix as
// BalanceCategoryCard.tsx): panelFlat's CSS rule only matches an element
// carrying Astryx's own astryx-card/astryx-item class — a bare div got
// zero border, and this card's own --surface-2 art block was rendering at
// the exact same value as the page's --surface-0 background, making the
// whole tile invisible against the page. Confirmed by screenshot, not
// assumed from the token names.
//
// padding={0}, not omitted (2026-09-13 follow-up, direct feedback: "images
// inside promo cards carousel should be edge to edge") — Card's own prop
// defaults to 4 whenever the prop is left out (padding == null resolves to
// 4 internally, confirmed by reading Card.tsx directly rather than
// assuming "no prop" means "no padding"), which still wrapped the art
// block in a gutter. Padding now lives only on the title row below the
// art, via .body in the module CSS.
export function PromoCard({ title, icon }: PromoCardProps) {
  return (
    <Card className={`${styles.root} panelFlat`} padding={0}>
      <div className={styles.art} aria-hidden="true">
        {icon}
      </div>
      <Text type="label" weight="semibold" className={styles.body}>
        {title}
      </Text>
    </Card>
  );
}
