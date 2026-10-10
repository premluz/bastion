import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import { notifyPrototypeUnavailable } from './PrototypeNotice';
import '../../theme/promo-bleed.css';
import styles from './PromoCardBleed.module.css';

export interface PromoCardBleedProps {
  title: string;
  image: string;
  eyebrow?: string;
  cta?: string;
}

// Full-bleed promo banner (2026-10-10, direct feedback with a reference): a
// photo running edge to edge whose top and bottom dissolve into the page
// background — the same --shell-fade shade the page itself uses at its top and
// bottom — with the copy bottom-left and a copper call to action. A distinct
// component from PromoCardFull (a framed card), in the same way PromoCardFull
// is from PromoCard: the geometry differs, not a flag on it. It is one slide
// for PromoCarousel's `bleed` variant, which supplies the edge-to-edge width.
//
// The call to action has no destination yet, so it says so rather than
// looking clickable and doing nothing.
export function PromoCardBleed({ title, image, eyebrow, cta }: PromoCardBleedProps) {
  return (
    <div className={styles.root}>
      <img className={styles.image} src={image} alt="" />
      <div className={styles.body}>
        <Text type="large" className={styles.title}>{title}</Text>
        {eyebrow && <Text type="supporting" color="secondary" data-eyebrow>{eyebrow}</Text>}
        {cta && <Button label={cta} variant="primary" size="sm" className={styles.cta} onClick={notifyPrototypeUnavailable} />}
      </div>
    </div>
  );
}
