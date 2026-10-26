import { useEffect, useMemo, useRef } from 'react';

export interface AssemblyClock {
  /** 0 = apart, 1 = assembled; read every frame. */
  progress: () => number;
  /** Fed the elapsed seconds each frame by the renderer. */
  onFrame: (deltaSeconds: number) => void;
}

// Runs one assembly (apart → assembled) each time `running` turns on, after `delaySeconds`, over `seconds`. Turning it off
// rewinds to apart, so the next opening plays again. Reduced motion skips straight to assembled.
export function useAssemblyClock(running: boolean, seconds: number, delaySeconds = 0): AssemblyClock {
  const elapsed = useRef(0);
  const waited = useRef(0);
  const live = useRef(running);
  live.current = running;
  useEffect(() => {
    if (!running) {
      elapsed.current = 0;
      waited.current = 0;
    }
  }, [running]);
  return useMemo(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      progress: () => elapsed.current,
      onFrame: (deltaSeconds) => {
        if (!live.current) return;
        // Waits out its delay first, so the assembly does not play unseen before the monolith appears.
        if (waited.current < delaySeconds) {
          waited.current += deltaSeconds;
          return;
        }
        elapsed.current = reduced ? 1 : Math.min(1, elapsed.current + deltaSeconds / seconds);
      },
    };
  }, [seconds, delaySeconds]);
}
