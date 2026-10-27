import { useState } from 'react';
import styles from './AssetLogo.module.css';

const SWATCH_COUNT = 6;

function hashToIndex(id: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % length;
}

// Placeholder mark set dropped into app/public/logos/ (2026-07-26,
// generic — no correspondence to any specific entity, unlike a real
// brand-logo drop would have). Listed explicitly rather than globbed:
// Vite/Storybook don't process public/ through the module graph, so
// there's no `import.meta.glob` reach into it at build or runtime — this
// list is the source of truth and must be kept in sync by hand if files
// are added or removed.
const LOGO_FILES = [
  'logoipsum-11.svg',
  'logoipsum-23.svg',
  'logoipsum-42.svg',
  'logoipsum-55.svg',
  'logoipsum-357.svg',
  'logoipsum-359.svg',
  'logoipsum-365.svg',
  'logoipsum-368.svg',
  'logoipsum-370.svg',
  'logoipsum-374.svg',
  'logoipsum-376.svg',
  'logoipsum-381.svg',
  'logoipsum-383.svg',
  'logoipsum-386.svg',
  'logoipsum-394.svg',
  'logoipsum-396.svg',
  'logoipsum-407.svg',
  'logoipsum-411.svg',
  'logoipsum-413.svg',
  'logoipsum-417.svg',
  'logoipsum-427.svg',
  'logoipsum-429.svg',
  'logoipsum-431.svg',
  'logoipsum-433.svg',
  'logoipsum-434.svg',
  'logoipsum-436.svg',
] as const;

// Per-entity logo (2026-07-26, direct feedback: "add to each entity
// different"). Same id-hash approach already used for the swatch
// fallback below, applied to a fixed file list instead of a token list —
// deterministic (the same entity always gets the same mark, stable
// across renders/sessions) and spreads entities across the available set
// rather than clustering. With ~26 marks and more entities than that,
// some repeats are unavoidable (pigeonhole) — swapping the hash for a
// full-list-position assignment would remove that, but requires knowing
// every OTHER entity's id too, which breaks this component's one-prop,
// standalone shape for a marginal gain over a big universe.
// Falls back to the original deterministic color swatch (direct
// feedback, 2026-07-20) if a file ever 404s, rather than a broken-image
// icon. A letter monogram was considered for that fallback and dropped:
// no "text on a colored fill" token exists anywhere in this stack, and
// inventing one would mean guessing per-hue contrast rather than
// proposing a real token.
// size (Phase 21): 'large' is Entity Detail's identity header. Both sizes are a
// circle (2026-10-27, direct feedback: logos sit inside a circle, the size of the
// list accessory), the generic mark cropped to fill it; the swatch fallback shares
// the same circle so a 404 never changes the layout.
export function AssetLogo({ id, size = 'default' }: { id: string; size?: 'default' | 'large' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={styles.root} data-size={size} data-swatch={hashToIndex(id, SWATCH_COUNT) + 1} />;
  }

  const file = LOGO_FILES[hashToIndex(id, LOGO_FILES.length)];
  return (
    <div className={styles.root} data-size={size}>
      <img className={styles.mark} src={`/logos/${file}`} alt="" onError={() => setFailed(true)} />
    </div>
  );
}
