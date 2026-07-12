import { useTrailStore } from "./stores/trailStore";
import type { ThinkingStep } from "../contracts/thinking";

// Monotonic generation counter: a new playTrail()/cancelTrail() call always
// supersedes whatever's in flight, so a stale player's pending setTimeout
// can never overwrite the store (or fire the wrong onComplete) after a
// second query arrives before the first trail finished.
let generation = 0;

export function playTrail(steps: ThinkingStep[], onComplete: () => void): void {
  const myGeneration = ++generation;
  const startedAt = Date.now();
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  const isCurrent = () => myGeneration === generation;

  function finishNow() {
    if (!isCurrent()) return;
    if (timeoutHandle) clearTimeout(timeoutHandle);
    useTrailStore.getState().finish(Date.now() - startedAt);
    onComplete();
  }

  function playStep(index: number) {
    if (!isCurrent()) return;
    const step = steps[index];
    if (!step) {
      finishNow();
      return;
    }
    useTrailStore.getState().setActiveIndex(index, Date.now() - startedAt);
    timeoutHandle = setTimeout(() => playStep(index + 1), step.durationMs);
  }

  useTrailStore.getState().start(steps, finishNow);

  if (steps.length === 0) {
    finishNow();
    return;
  }

  playStep(0);
}

// Invalidates any in-flight player without starting a new one — for the
// unresolved-query path, which has no trail to play.
export function cancelTrail(): void {
  generation += 1;
  useTrailStore.getState().clear();
}
