/**
 * Critically damped approach: moves `current` toward `target` with a smooth start and no overshoot,
 * independent of frame rate. `rate` is 1/seconds; the value is ~95% of the way after 3/rate seconds.
 */
export function damp(current: number, target: number, rate: number, deltaSeconds: number): number {
  return target + (current - target) * Math.exp(-rate * deltaSeconds);
}
