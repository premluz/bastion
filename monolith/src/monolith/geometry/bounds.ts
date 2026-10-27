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

/** Facets per quarter-turn of a soft corner: enough for a smooth silhouette; shading is smoothed per vertex. */
const ROUND_STEPS = 6;

/**
 * Planes tangent to a cube with edges and corners rounded at `radius`: along each edge, planes swept round the
 * edge's cylinder; at each corner, planes tangent to its sphere. dot(n, p) <= (1 − r)·Σ|n| + r.
 */
export function roundPlanes(radius: number): BoundPlane[] {
  const planes: BoundPlane[] = [];
  const tangent = (n: Vec3): BoundPlane => ({ n, d: (1 - radius) * (Math.abs(n[0]) + Math.abs(n[1]) + Math.abs(n[2])) + radius, kind: 'outer' });
  const quarter = Array.from({ length: ROUND_STEPS - 1 }, (_, k) => ((k + 1) / ROUND_STEPS) * (Math.PI / 2));
  for (const [i, j] of [[0, 1], [1, 2], [0, 2]] as const) {
    for (const si of [-1, 1]) {
      for (const sj of [-1, 1]) {
        for (const t of quarter) {
          const n = [0, 0, 0];
          n[i] = si * Math.cos(t);
          n[j] = sj * Math.sin(t);
          planes.push(tangent([n[0] ?? 0, n[1] ?? 0, n[2] ?? 0]));
        }
      }
    }
  }
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        for (const a of quarter) {
          for (const b of quarter) {
            planes.push(tangent([sx * Math.cos(a) * Math.sin(b), sy * Math.sin(a) * Math.sin(b), sz * Math.cos(b)]));
          }
        }
      }
    }
  }
  return planes;
}
