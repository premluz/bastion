import { useCallback, useEffect, useRef, useState } from 'react';
import type { Appearance } from './settings';

const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface Fade {
  readonly bitmap: ImageBitmap;
  /** A new key restarts the CSS animation if fades ever follow each other directly. */
  readonly key: number;
}

/**
 * Holds the appearance on screen apart from the one requested: the change is committed only once the
 * old frame has been captured, so the old look can fade out over the new one. Reduced motion skips the fade.
 */
export function useAppearanceTransition(requested: Appearance) {
  const [displayed, setDisplayed] = useState(requested);
  const [fade, setFade] = useState<Fade | null>(null);
  const keys = useRef(0);

  useEffect(() => {
    if (requested !== displayed && prefersReducedMotion()) setDisplayed(requested);
  }, [requested, displayed]);

  const snapshot = useCallback((bitmap: ImageBitmap, next: Appearance) => {
    keys.current += 1;
    setFade({ bitmap, key: keys.current });
    setDisplayed(next);
  }, []);

  const failure = useCallback((next: Appearance, cause: unknown) => {
    setDisplayed(next);
    throw new Error('Appearance crossfade: could not capture the current frame', { cause });
  }, []);

  const done = useCallback(() => {
    setFade((current) => {
      current?.bitmap.close();
      return null;
    });
  }, []);

  return { displayed, fade, snapshot, failure, done };
}
