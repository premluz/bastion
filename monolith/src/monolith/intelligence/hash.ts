/** Deterministic pseudo-random value in [0, 1) for any real seed. */
export function hash1(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

/** Smooth 1D value noise in [0, 1]: irregular, continuous, never periodic. */
export function valueNoise(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  return hash1(i) * (1 - u) + hash1(i + 1) * u;
}
