import { useLayoutEffect, useState, type RefObject } from 'react';

const LIGHT_TOKEN = '--orb-light-ground';

// Light themes render the monolith as frosted glass, dark ones as graphite. Read from the token the
// plasma orb already uses, and followed live (Storybook's toolbar, the app's own switch): useLiquidOrb
// watches the same attributes.
export function useMonolithAppearance(host: RefObject<HTMLElement | null>): 'dark' | 'light' | null {
  const [appearance, setAppearance] = useState<'dark' | 'light' | null>(null);
  useLayoutEffect(() => {
    const element = host.current;
    if (element === null) return;
    const read = () => setAppearance(getComputedStyle(element).getPropertyValue(LIGHT_TOKEN).trim() === '1' ? 'light' : 'dark');
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-astryx-theme'] });
    return () => observer.disconnect();
  }, [host]);
  return appearance;
}
