import { Color } from 'three';

/** Khronos PBR Neutral, the curve the composer's NEUTRAL tone mapping applies (linear in, linear out). */
export function neutralToneMap(c: readonly [number, number, number]): [number, number, number] {
  const START = 0.76;
  const DESATURATION = 0.15;
  const x = Math.min(...c);
  const offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  let out: [number, number, number] = [c[0] - offset, c[1] - offset, c[2] - offset];
  const peak = Math.max(...out);
  if (peak < START) return out;
  const d = 1 - START;
  const newPeak = 1 - (d * d) / (peak + d - START);
  out = [out[0] * (newPeak / peak), out[1] * (newPeak / peak), out[2] * (newPeak / peak)];
  const g = 1 - 1 / (DESATURATION * (peak - newPeak) + 1);
  return [out[0] + (newPeak - out[0]) * g, out[1] + (newPeak - out[1]) * g, out[2] + (newPeak - out[2]) * g];
}

/**
 * The scene background that, after tone mapping, lands exactly on the brand ground colour —
 * so the canvas can be opaque (letting the outer glow spread onto it) without a visible seam.
 */
export function toneMappedGround(hex: string): Color {
  const target = new Color(hex);
  const goal: [number, number, number] = [target.r, target.g, target.b];
  let input: [number, number, number] = [...goal];
  for (let i = 0; i < 80; i += 1) {
    const out = neutralToneMap(input);
    input = [input[0] + (goal[0] - out[0]), input[1] + (goal[1] - out[1]), input[2] + (goal[2] - out[2])];
  }
  return new Color(input[0], input[1], input[2]);
}

export const luminance = (c: Color): number => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
