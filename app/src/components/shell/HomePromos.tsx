import { PromoCardBleed } from './PromoCardBleed';
import { PromoCardFull } from './PromoCardFull';
import { PromoCarousel } from './PromoCarousel';

interface Promo {
  id: string;
  title: string;
  eyebrow?: string;
  icon?: string;
  backgroundImage?: string;
  /** What the full-bleed banner shows; it needs a photo and a call to action on every slide. */
  bleed: { image: string; cta: string; title?: string; eyebrow?: string };
}

// Placeholder tiles (2026-09-13) — no real promo/offers content exists in
// this fork's universe seed; authored copy only, same "never fabricate
// DATA" line this page already draws for Earn/NFTs (fabricating promo
// COPY carries no such risk — there's no number here to get wrong — but
// the tiles themselves are still a stand-in for a real promotions feed,
// not real offers). The full-bleed photos reuse the existing wallet-card art.
const PROMOS: readonly Promo[] = [
  { id: 'defi', eyebrow: 'Lend Earn Grow', title: 'Explore DeFi opportunities', backgroundImage: '/images/hero-promo.jpg',
    bleed: { image: '/images/hero-promo.jpg', cta: 'Explore', title: 'DeFi opportunities' } },
  { id: 'idle-cash', title: 'Put your idle cash to work at 6.4%',
    bleed: { image: '/images/card02.jpg', cta: 'Learn more', eyebrow: 'Earn' } },
  { id: 'lounge', title: 'Free premium lounge at airports', icon: '🎁',
    bleed: { image: '/images/card03.jpg', cta: 'See perks', eyebrow: 'Perks' } },
];

// Shared by both homes (2026-10-09). `card` is the framed one-at-a-time card
// the assets home uses; `bleed` (2026-10-10) is the full-bleed banner the
// agent home uses.
export function HomePromos({ variant = 'card' }: { variant?: 'card' | 'bleed' }) {
  return (
    <PromoCarousel aria-label="Promotions" variant={variant}>
      {PROMOS.map((promo) => variant === 'bleed' ? (
        <PromoCardBleed key={promo.id} title={promo.bleed.title ?? promo.title} image={promo.bleed.image} cta={promo.bleed.cta}
          {...(promo.bleed.eyebrow ?? promo.eyebrow ? { eyebrow: promo.bleed.eyebrow ?? promo.eyebrow } : {})} />
      ) : (
        <PromoCardFull key={promo.id} title={promo.title} {...(promo.icon ? { icon: promo.icon } : {})}
          {...(promo.backgroundImage ? { backgroundImage: promo.backgroundImage, ...(promo.eyebrow ? { eyebrow: promo.eyebrow } : {}) } : {})} />
      ))}
    </PromoCarousel>
  );
}
