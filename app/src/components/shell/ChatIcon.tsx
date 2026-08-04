import type { SVGProps } from 'react';

// No semantic "chat/message/comment" IconName exists in Astryx's closed
// set (checked live via `astryx docs icons` — no match) — same gap class
// as DocumentIcon.tsx, same fix: a real IconType component, matching
// Astryx's own defaultIcons.tsx convention (24x24 viewBox, currentColor,
// 1.5 stroke, round caps).
export function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5.5h16a1 1 0 0 1 1 1V15a1 1 0 0 1-1 1H9l-4.5 4V16H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z" />
    </svg>
  );
}
