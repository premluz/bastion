import { useEffect, useState } from 'react';

// Phase 18: the one width-reading primitive both the desktop-only notice
// (<768px) and tier 2's own fit-calculation (768-1024px) need — a plain
// resize listener, not a media query per threshold, so the same live
// number serves both. SSR-safe default (0) never matters here: this app
// only ever runs inside a browser (Storybook iframe today), never
// server-rendered.
export function useViewportWidth(): number {
  const [width, setWidth] = useState(() => (typeof window === 'undefined' ? 0 : window.innerWidth));

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}
