import { useState } from 'react';

const VIZ_TOKENS = ['--viz-1', '--viz-2', '--viz-3', '--viz-4', '--viz-5', '--viz-6'] as const;

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
export function AssetLogo({ id }: { id: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const token = VIZ_TOKENS[hashToIndex(id, VIZ_TOKENS.length)];
    return (
      <div
        style={{
          width: 'var(--space-32)',
          height: 'var(--space-32)',
          borderRadius: 'var(--radius-8)',
          background: `var(${token})`,
          flexShrink: 0,
        }}
      />
    );
  }

  const file = LOGO_FILES[hashToIndex(id, LOGO_FILES.length)];

  // Outer box stays the same 32x32 slot the swatch fallback uses (layout
  // consistency across grid/table/strip rows); the mark itself renders at
  // 24x24, centered inside it — these are generic external SVGs of
  // varying internal padding/aspect ratio, so sizing down with breathing
  // room (objectFit: contain, never cropped) reads cleaner than stretching
  // edge-to-edge.
  return (
    <div
      style={{
        width: 'var(--space-32)',
        height: 'var(--space-32)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <img
        src={`/logos/${file}`}
        alt=""
        style={{
          width: 'var(--space-24)',
          height: 'var(--space-24)',
          borderRadius: 'var(--radius-8)',
          objectFit: 'contain',
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
