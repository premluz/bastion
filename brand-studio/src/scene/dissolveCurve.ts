import { smootherstep } from '../monolith/assembly/timeline';

/** Seconds to dissolve out of the old variant and into the new one — slow enough to read as calm. */
export const DISSOLVE_OUT_SECONDS = 0.55;
export const DISSOLVE_IN_SECONDS = 0.85;
/** Past the noise ceiling of 1, so every fragment is discarded at the swap. */
export const FULLY_DISSOLVED = 1.02;

/** Eased: starts and ends with zero speed, so the dissolve neither jolts in nor stops dead. */
export const dissolveOut = (t: number): number => FULLY_DISSOLVED * smootherstep(t);
export const dissolveIn = (t: number): number => FULLY_DISSOLVED * (1 - smootherstep(t));

/** The phase t ∈ [0, 1] at which `dissolveOut` equals `level`, so a new switch continues from where it is. */
export function outPhaseFor(level: number): number {
  const target = Math.min(1, Math.max(0, level / FULLY_DISSOLVED));
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    if (smootherstep(mid) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
