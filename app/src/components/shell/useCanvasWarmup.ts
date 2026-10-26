import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lets a canvas that is mounted hidden render a few frames before it is paused, so its first real frame
 * does not pay for compiling its shaders. `armed` mounts it, once the page has settled and is idle;
 * `onFrame` is fed by the renderer, and `isWarm` turns true after `frames` of them.
 */
export function useCanvasWarmup(frames: number) {
  const [armed, setArmed] = useState(false);
  const [isWarm, setIsWarm] = useState(false);
  const seen = useRef(0);
  useEffect(() => {
    // Idle time after the first paint, with a ceiling for browsers (or a busy page) that never go idle.
    const done = () => setArmed(true);
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(done, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(done, 500);
    return () => window.clearTimeout(id);
  }, []);
  const onFrame = useCallback(() => {
    seen.current += 1;
    if (seen.current === frames) setIsWarm(true);
  }, [frames]);
  return { armed, isWarm, onFrame };
}
