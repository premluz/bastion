import { useEffect, useMemo, useRef, type MouseEvent } from 'react';
import { cssDurationMs } from './cssDuration';
import type { AssemblyClock } from './useAssemblyClock';

export function createChatCubeAssembly(duration: () => number, reduced: boolean) {
  let progress = 1;
  let pending = 0;
  let seconds = 0;
  return {
    progress: () => progress,
    replay: () => {
      if (reduced) return;
      seconds = duration();
      if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('Chat cube assembly needs a positive duration');
      if (progress === 1 && pending === 0) progress = 0;
      else pending++;
    },
    onFrame: (delta: number) => {
      if (progress === 1) {
        if (pending === 0) return;
        pending--;
        progress = 0;
      }
      progress = Math.min(1, progress + delta / seconds);
    },
  } satisfies AssemblyClock & { replay: () => void };
}

export function useChatCubeAssembly(messageCount: number, enabled: boolean) {
  const previous = useRef(messageCount);
  const clock = useMemo(() => createChatCubeAssembly(
    () => cssDurationMs('--dock-cube-assembly-duration') / 1000,
    !enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  ), [enabled]);
  useEffect(() => {
    if (previous.current !== messageCount) clock.replay();
    previous.current = messageCount;
  }, [messageCount, clock]);
  return useMemo(() => ({
    ...clock,
    onAction: (event: MouseEvent<HTMLElement>) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('button, [role="button"]');
      if (button !== null && !button.matches(':disabled, [aria-disabled="true"]')) clock.replay();
    },
  }), [clock]);
}
