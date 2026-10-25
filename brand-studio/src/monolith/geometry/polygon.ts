import { EPS, add, dot, scale, sub, type Vec3 } from './vec';

export interface Plane {
  /** Unit normal; the kept half-space is dot(n, p) <= d. */
  readonly n: Vec3;
  readonly d: number;
}

export const signedDistance = (plane: Plane, p: Vec3): number => {
  const s = dot(plane.n, p) - plane.d;
  return Math.abs(s) < EPS ? 0 : s;
};

export interface PolygonSplit {
  readonly inside: Vec3[];
  readonly outside: Vec3[];
}

/** Sutherland–Hodgman split of a convex polygon by a plane. */
export function splitPolygon(points: readonly Vec3[], plane: Plane): PolygonSplit {
  const inside: Vec3[] = [];
  const outside: Vec3[] = [];
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (a === undefined || b === undefined) continue;
    const da = signedDistance(plane, a);
    const db = signedDistance(plane, b);
    if (da <= 0) inside.push(a);
    if (da >= 0) outside.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const hit = add(a, scale(sub(b, a), da / (da - db)));
      inside.push(hit);
      outside.push(hit);
    }
  }
  return { inside: dedupe(inside), outside: dedupe(outside) };
}

function dedupe(points: readonly Vec3[]): Vec3[] {
  const out: Vec3[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (last !== undefined && near(last, p)) continue;
    out.push(p);
  }
  const first = out[0];
  const last = out[out.length - 1];
  if (out.length > 1 && first !== undefined && last !== undefined && near(first, last)) out.pop();
  return out.length >= 3 ? out : [];
}

const near = (a: Vec3, b: Vec3): boolean =>
  Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9 && Math.abs(a[2] - b[2]) < 1e-9;
