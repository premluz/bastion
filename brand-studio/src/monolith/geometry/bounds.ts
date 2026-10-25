import type { BoundPlane } from './convexCell';
import { normalize, scale, type Vec3 } from './vec';

export type Direction = 'x' | 'y' | 'z' | Vec3;

/** A half-space dot(n, p) <= d, authored before the cut width is known. */
export interface BoundSpec {
  readonly n: Vec3;
  readonly d: number;
  readonly mode: 'cut' | 'free';
  /** Free bounds only: how far, in cut widths, the cell reaches past `d`. */
  readonly reach: number;
}

const AXES: Record<'x' | 'y' | 'z', Vec3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };

function unit(dir: Direction, d: number): { n: Vec3; d: number } {
  const raw = typeof dir === 'string' ? AXES[dir] : dir;
  const len = Math.hypot(raw[0], raw[1], raw[2]);
  return { n: normalize(raw), d: d / len };
}

function flip(spec: { n: Vec3; d: number }): { n: Vec3; d: number } {
  return { n: scale(spec.n, -1), d: -spec.d };
}

/** The piece sits on the low side of the cut plane dot(dir, p) = d. */
export const below = (dir: Direction, d: number): BoundSpec => ({ ...unit(dir, d), mode: 'cut', reach: 0 });
/** The piece sits on the high side of the cut plane dot(dir, p) = d. */
export const above = (dir: Direction, d: number): BoundSpec => ({ ...flip(unit(dir, d)), mode: 'cut', reach: 0 });
/** Internal seam: the cell ends at dot(dir, p) <= d (+ reach cut widths). */
export const lo = (dir: Direction, d: number, reach = 0): BoundSpec => ({ ...unit(dir, d), mode: 'free', reach });
/** Internal seam: the cell starts at dot(dir, p) >= d (− reach cut widths). */
export const hi = (dir: Direction, d: number, reach = 0): BoundSpec => ({ ...flip(unit(dir, d)), mode: 'free', reach });

export function resolveBound(spec: BoundSpec, cutWidth: number): BoundPlane {
  const shift = spec.mode === 'cut' ? -cutWidth / 2 : spec.reach * cutWidth;
  return { n: spec.n, d: spec.d + shift, kind: spec.mode };
}

/** Micro-bevel planes along the twelve cube edges and eight corners. */
export function chamferPlanes(size: number): BoundPlane[] {
  const planes: BoundPlane[] = [];
  const signs = [-1, 1];
  const pairs: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 2],
  ];
  for (const [i, j] of pairs) {
    for (const si of signs) {
      for (const sj of signs) {
        const n = [0, 0, 0];
        n[i] = si;
        n[j] = sj;
        planes.push({ n: normalize([n[0] ?? 0, n[1] ?? 0, n[2] ?? 0]), d: (2 - size) / Math.SQRT2, kind: 'outer' });
      }
    }
  }
  for (const sx of signs) {
    for (const sy of signs) {
      for (const sz of signs) {
        planes.push({ n: normalize([sx, sy, sz]), d: (3 - 1.8 * size) / Math.sqrt(3), kind: 'outer' });
      }
    }
  }
  return planes;
}
