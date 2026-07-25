import type { SVGProps } from 'react';

// No semantic "document/file/page" `IconName` exists in Astryx's closed set
// (exhibit 12, joining exhibits 6/7/8/9/10/11's other missing glyphs —
// checked live via `astryx search document`/`astryx component Icon
// --dense`, not guessed). `viewColumns` was standing in for it in both
// ArtifactStackControl and ArtifactCard, but reads as a columns/grid
// glyph, not a document — reported live. Built as a real IconType
// component, not a raw inline SVG, matching Astryx's own defaultIcons.tsx
// convention exactly (24x24 viewBox, currentColor, 1.5 stroke, round
// caps), same precedent as Sidebar.tsx's PlusIcon.
export function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3.5h7l5 5V19.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M13 3.5V8.5a1 1 0 0 0 1 1H18.5" />
      <path d="M8.5 13h7M8.5 16.5h5" />
    </svg>
  );
}
