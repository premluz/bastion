import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import styles from './PromoCardFull.module.css';

interface PromoCardFullProps {
  title: string;
  icon?: string;
  // Optional whole-card background image (2026-09-16, direct feedback:
  // "make comp configurable so it may have also background for whole
  // card and not image, being attribute optional") — when supplied, the
  // card renders this image edge-to-edge behind the title instead of the
  // right-side square art block; icon/backgroundImage are mutually
  // exclusive layouts, not combined. Still a real image asset, not a
  // fabricated gradient/illustration — same "no invented imagery" posture
  // as the rest of this card family.
  backgroundImage?: string;
  // Small uppercase line above the title (hero variant only).
  eyebrow?: string;
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
// The image variant renders a real <img> behind the copy (2026-10-06): the
// earlier inline background-image style never reached the DOM, and inline
// styles are off-limits anyway.
export function PromoCardFull({ title, icon, backgroundImage, eyebrow }: PromoCardFullProps) {
  if (backgroundImage) {
    return (
      <Card className={`${styles.root} ${styles.hero} panelFlat`} padding={0}>
        <img className={styles.heroImage} src={backgroundImage} alt="" />
        <div className={styles.heroBody}>
          {eyebrow && <Text type="supporting" color="secondary" data-eyebrow>{eyebrow}</Text>}
          <Text type="large" className={styles.heroTitle}>{title}</Text>
          <ArrowLongRightIcon className={styles.heroArrow} aria-hidden="true" />
        </div>
      </Card>
    );
  }
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
