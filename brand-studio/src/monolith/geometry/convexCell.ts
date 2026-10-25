import { signedDistance, splitPolygon, type Plane } from './polygon';
import { centroid, cross, dot, normalize, polygonAreaVector, sub, type Vec3 } from './vec';

/**
 * outer — the monolith's exterior skin.
 * cut   — a wall of an architectural slot (offset by half the cut width).
 * free  — an internal seam between two cells of the same piece; must end up covered.
 */
export type FaceKind = 'outer' | 'cut' | 'free';

export interface BoundPlane extends Plane {
  readonly kind: FaceKind;
}

export interface Face {
  readonly points: readonly Vec3[];
  readonly plane: BoundPlane;
}

export type ConvexCell = readonly Face[];

const HALF = 1;

function orient(points: readonly Vec3[], normal: Vec3): Vec3[] {
  const area = polygonAreaVector(points);
  return dot(area, normal) >= 0 ? [...points] : [...points].reverse();
}

export function unitBox(): Face[] {
  const faces: Face[] = [];
  for (let axis = 0; axis < 3; axis += 1) {
    for (const sign of [-1, 1]) {
      const u = (axis + 1) % 3;
      const v = (axis + 2) % 3;
      const corners: Vec3[] = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([a = 0, b = 0]) => {
        const p = [0, 0, 0];
        p[axis] = sign * HALF;
        p[u] = a * HALF;
        p[v] = b * HALF;
        return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0] as const;
      });
      const n: Vec3 = axis === 0 ? [sign, 0, 0] : axis === 1 ? [0, sign, 0] : [0, 0, sign];
      faces.push({ points: orient(corners, n), plane: { n, d: HALF, kind: 'outer' } });
    }
  }
  return faces;
}

/** Orders coplanar points counter-clockwise around `normal`. */
function orderAround(points: readonly Vec3[], normal: Vec3): Vec3[] {
  const c = centroid(points);
  const helper: Vec3 = Math.abs(normal[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = normalize(cross(normal, helper));
  const v = cross(normal, u);
  return [...points].sort((a, b) => {
    const da = sub(a, c);
    const db = sub(b, c);
    return Math.atan2(dot(da, v), dot(da, u)) - Math.atan2(dot(db, v), dot(db, u));
  });
}

function uniquePoints(points: readonly Vec3[]): Vec3[] {
  const out: Vec3[] = [];
  for (const p of points) {
    const seen = out.some(
      (q) => Math.abs(q[0] - p[0]) < 1e-9 && Math.abs(q[1] - p[1]) < 1e-9 && Math.abs(q[2] - p[2]) < 1e-9,
    );
    if (!seen) out.push(p);
  }
  return out;
}

/** Keeps the part of a convex cell where dot(n, p) <= d, capping the opening with a face of `plane.kind`. */
export function clipCell(cell: ConvexCell, plane: BoundPlane): Face[] {
  let anyOutside = false;
  let anyInside = false;
  for (const face of cell) {
    for (const p of face.points) {
      const s = signedDistance(plane, p);
      if (s > 0) anyOutside = true;
      if (s < 0) anyInside = true;
    }
  }
  if (!anyOutside) return [...cell];
  if (!anyInside) return [];

  const faces: Face[] = [];
  const capPoints: Vec3[] = [];
  for (const face of cell) {
    const { inside } = splitPolygon(face.points, plane);
    if (inside.length < 3) continue;
    faces.push({ points: inside, plane: face.plane });
    for (const p of inside) if (signedDistance(plane, p) === 0) capPoints.push(p);
  }
  const cap = uniquePoints(capPoints);
  if (cap.length >= 3) faces.push({ points: orderAround(cap, plane.n), plane });
  return faces;
}

export function buildCell(planes: readonly BoundPlane[]): Face[] {
  return planes.reduce<Face[]>((cell, plane) => (cell.length === 0 ? cell : clipCell(cell, plane)), unitBox());
}
