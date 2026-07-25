import type { SVGProps } from 'react';

// No "bell/notification" `IconName` exists in Astryx's closed set
// (exhibit 8 — `warning` had been standing in for it since Phase 8H WO-1).
// Reported live: labeling that control "Alerts" with a warning-triangle
// glyph read as an actual warning, not a notifications affordance. Built
// as a real IconType component, matching Astryx's own defaultIcons.tsx
// convention exactly (24x24 viewBox, currentColor, 1.5 stroke, round
// caps), same precedent as PlusIcon/DocumentIcon.
export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 4.5a5 5 0 0 0-5 5v3.19c0 .6-.24 1.18-.66 1.6l-.98.99c-.63.63-.18 1.72.71 1.72h11.86c.89 0 1.34-1.09.71-1.72l-.98-.99a2.27 2.27 0 0 1-.66-1.6V9.5a5 5 0 0 0-5-5z" />
      <path d="M10.3 19a1.8 1.8 0 0 0 3.4 0" />
    </svg>
  );
}
