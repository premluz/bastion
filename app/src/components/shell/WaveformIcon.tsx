import type { SVGProps } from 'react';

// Sound-wave bars for voice mode (2026-10-12, direct feedback: not the radio-wave
// glyph). Neither Astryx's closed IconName set nor Heroicons has one, so it is built
// as an IconType component the way BellIcon is: 24x24 viewBox, currentColor, 1.5
// stroke, round caps.
export function WaveformIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 10.5v3" />
    </svg>
  );
}
