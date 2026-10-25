import { useEffect, useMemo, useRef } from 'react';

export interface AssemblyClock {
  /** 0 = apart, 1 = assembled; read every frame. */
  progress: () => number;
  /** Fed the elapsed seconds each frame by the renderer. */
  onFrame: (deltaSeconds: number) => void;
}

// Runs one assembly (apart → assembled) each time `running` turns on, over `seconds`. Turning it off
// rewinds to apart, so the next opening plays again. Reduced motion skips straight to assembled.
export function useAssemblyClock(running: boolean, seconds: number): AssemblyClock {
  const elapsed = useRef(0);
  const live = useRef(running);
  live.current = running;
  useEffect(() => {
    if (!running) elapsed.current = 0;
  }, [running]);
  return useMemo(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return {
      progress: () => elapsed.current,
      onFrame: (deltaSeconds) => {
        if (live.current) elapsed.current = reduced ? 1 : Math.min(1, elapsed.current + deltaSeconds / seconds);
      },
    };
  }, [seconds]);
}
