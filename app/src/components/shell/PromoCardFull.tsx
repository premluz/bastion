import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import styles from './PromoCardFull.module.css';

interface PromoCardFullProps {
  title: string;
  icon?: string;
  // Optional whole-card background image (2026-09-16, direct feedback:
  // "make comp configurable so it may have also background for whole
  // card and not image, being attribute optional") — when supplied, the
  // card renders this image edge-to-edge behind the title instead of the
  // right-side square art block; icon/backgroundImage are mutually
  // exclusive layouts, not combined. Still an image URL, not a fabricated
  // gradient/illustration — same "no invented imagery" posture as the
  // rest of this card family; a real asset is required to opt in.
  backgroundImage?: string;
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
// KNOWN ISSUE (2026-09-16, not yet resolved): the backgroundImage branch's
// inline style never reaches the DOM in this app's actual render — the
// React fiber's own props object holds the correct value (confirmed by
// reading it directly), and setting the same property via the DOM API on
// the same live element works instantly, but React's own commit never
// applies it. Ruled out so far: Card prop-forwarding (moved the style to a
// plain div, still fails), a custom-property-only style object (switched
// to a plain backgroundImage property, still fails), stale HMR (fails on
// a fresh browser context), and a conditional-branch reconciliation issue
// (restructured to one consistent JSX tree, still fails). Flagging rather
// than presenting this as working: the prop/plumbing below is real and
// type-checked, but the visual result does not currently render.
export function PromoCardFull({ title, icon, backgroundImage }: PromoCardFullProps) {
  return (
    <Card className={`${styles.root} panelFlat`} padding={0}>
      {backgroundImage ? (
        <div className={styles.withBackground} style={{ backgroundImage: `url(${backgroundImage})` }}>
          <Text type="label" weight="semibold" className={styles.backgroundBody}>
            {title}
          </Text>
        </div>
      ) : (
        <>
          <Text type="label" weight="semibold" className={styles.body}>
            {title}
          </Text>
          <div className={styles.art} aria-hidden="true">
            {icon}
          </div>
        </>
      )}
    </Card>
  );
}
