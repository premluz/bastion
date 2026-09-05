import type { SVGProps } from 'react';

// Astryx's semantic icon set (checked via `astryx docs icons`, the full
// catalog — no grid/card-view name exists in it) has no fit for "grid
// view"; its own docs sanction passing a custom SVG component directly
// for exactly this case ("For icons not in the semantic list, pass an
// SVG component directly"). Stroke-based, 1.5px, currentColor — matching
// the semantic set's own default SVGs so it doesn't look like a foreign
// icon style next to them. Extracted out of DiscoverAssetsSection.tsx
// (2026-09-02) once WatchlistPage.tsx needed the identical grid/table
// view toggle — shared, not duplicated.
export function GridViewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}
