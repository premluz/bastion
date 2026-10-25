import { smootherstep, window01 } from './timeline';

/**
 * Sequences always run from shape to shape: the first part plays the assembly backwards
 * (assembled → apart), the rest plays it forwards (apart → assembled). Both halves reuse the
 * same pure, collision-tested sequence, so scrubbing stays deterministic.
 */
const RELEASE_SHARE = 0.3;
/** The formation makes one slow full turn while apart and arrives facing as it started. */
const TURN = { start: 0.08, end: 0.78 } as const;
const STILL_SHARE = 0.04;

export function releaseThenAssemble(progress: number): number {
  if (progress < RELEASE_SHARE) return 1 - smootherstep(progress / RELEASE_SHARE);
  return (progress - RELEASE_SHARE) / (1 - RELEASE_SHARE);
}

export function formationTurn(progress: number): number {
  return Math.PI * 2 * smootherstep(window01(progress, TURN.start, TURN.end));
}

export function withRelease(name: (progress: number) => string): (progress: number) => string {
  return (progress) => {
    if (progress < STILL_SHARE) return 'Stillness';
    if (progress < RELEASE_SHARE) return 'Release';
    return name(releaseThenAssemble(progress));
  };
}
