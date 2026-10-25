import type { PieceModel, Polygon, VariantSpec } from '../geometry/types';
import { add, cross, dot, length, normalize, scale, sub, type Vec3 } from '../geometry/vec';

export interface JunctionMap {
  /** Points inside the monolith where real slot walls exist; the intelligence travels between them. */
  readonly junctions: readonly Vec3[];
  /** The main structural junction — where most cut planes meet. The hidden core sits here. */
  readonly core: Vec3;
}

interface CutPlane {
  readonly n: Vec3;
  readonly d: number;
}

const ON_WALL = 0.07;
const MIN_SPACING = 0.28;
const MAX_JUNCTIONS = 10;
const INTERIOR = 0.88;
const LINE_SAMPLES = [-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8];

function distinctCutPlanes(variant: VariantSpec): CutPlane[] {
  const planes: CutPlane[] = [];
  for (const bound of variant.pieces.flatMap((p) => p.cells.flat())) {
    if (bound.mode !== 'cut') continue;
    const lead = bound.n.find((c) => Math.abs(c) > 1e-6) ?? 1;
    const plane = lead < 0 ? { n: scale(bound.n, -1), d: -bound.d } : { n: bound.n, d: bound.d };
    const seen = planes.some((q) => length(sub(q.n, plane.n)) < 1e-6 && Math.abs(q.d - plane.d) < 1e-6);
    if (!seen) planes.push(plane);
  }
  return planes;
}

function distanceToPolygon(p: Vec3, polygon: Polygon): number {
  const n = polygon.normal;
  const origin = polygon.points[0];
  if (origin === undefined) return Infinity;
  const height = dot(n, sub(p, origin));
  const q = sub(p, scale(n, height));
  let inside = true;
  let edge = Infinity;
  polygon.points.forEach((a, i) => {
    const b = polygon.points[(i + 1) % polygon.points.length];
    if (b === undefined) return;
    const ab = sub(b, a);
    if (dot(cross(ab, sub(q, a)), n) < -1e-9) inside = false;
    const t = Math.min(1, Math.max(0, dot(sub(p, a), ab) / Math.max(dot(ab, ab), 1e-12)));
    edge = Math.min(edge, length(sub(p, add(a, scale(ab, t)))));
  });
  return inside ? Math.abs(height) : edge;
}

const isInterior = (p: Vec3): boolean => Math.max(...p.map(Math.abs)) < INTERIOR;

export function findJunctions(variant: VariantSpec, pieces: readonly PieceModel[]): JunctionMap {
  const planes = distinctCutPlanes(variant);
  const walls = pieces.flatMap((piece) => piece.walls);
  const wallsOf = (plane: CutPlane): Polygon[] => walls.filter((w) => Math.abs(Math.abs(dot(w.normal, plane.n)) - 1) < 1e-6);
  const touches = (p: Vec3, plane: CutPlane): boolean => wallsOf(plane).some((w) => distanceToPolygon(p, w) < ON_WALL);
  const meeting = (p: Vec3): number => planes.filter((plane) => touches(p, plane)).length;

  const crossings: Vec3[] = [];
  planes.forEach((a, i) =>
    planes.slice(i + 1).forEach((b) => {
      const dir = cross(a.n, b.n);
      if (length(dir) < 1e-3) return;
      const c = dot(a.n, b.n);
      const base = scale(add(scale(a.n, a.d - b.d * c), scale(b.n, b.d - a.d * c)), 1 / (1 - c * c));
      const u = normalize(dir);
      const onBoth = LINE_SAMPLES.map((t) => add(base, scale(u, t))).filter(
        (p) => isInterior(p) && touches(p, a) && touches(p, b),
      );
      crossings.push(...onBoth);
    }),
  );

  const centres: Vec3[] = planes.flatMap((plane) => {
    const helper: Vec3 = Math.abs(plane.n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    const u = normalize(cross(plane.n, helper));
    const v = cross(plane.n, u);
    const c = scale(plane.n, plane.d);
    return [c, add(c, scale(u, 0.55)), add(c, scale(u, -0.55)), add(c, scale(v, 0.55)), add(c, scale(v, -0.55))].filter(
      (p) => isInterior(p) && touches(p, plane),
    );
  });

  const junctions: Vec3[] = [];
  for (const p of [...crossings, ...centres]) {
    if (junctions.length >= MAX_JUNCTIONS) break;
    if (junctions.every((q) => length(sub(p, q)) > MIN_SPACING)) junctions.push(p);
  }
  if (junctions.length === 0) throw new Error(`${variant.id}: no internal junctions found on the cut walls`);

  const ranked = [...crossings, ...junctions].sort((a, b) => meeting(b) - meeting(a) || length(a) - length(b));
  const core = ranked[0] ?? junctions[0] ?? [0, 0, 0];
  return { junctions, core };
}
