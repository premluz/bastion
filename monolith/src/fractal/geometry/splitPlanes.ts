import { buildCell, type BoundPlane, type Face } from '../../monolith/geometry/convexCell';
import { add, centroid, dot, normalize, polygonAreaVector, scale, type Vec3 } from '../../monolith/geometry/vec';
import { hash1 } from '../../monolith/intelligence/hash';

/**
 * The brand's cut vocabulary as a splitting step: a flat seam across a region's longest axis, or a
 * shallow diagonal like the monolith variants. Every choice is seeded by the region's path, so the
 * same seed always breaks the same way.
 */
export interface Box {
  readonly min: Vec3;
  readonly max: Vec3;
}

export const X_AXIS: Vec3 = [1, 0, 0];
export const Y_AXIS: Vec3 = [0, 1, 0];
export const Z_AXIS: Vec3 = [0, 0, 1];
const AXES: readonly Vec3[] = [X_AXIS, Y_AXIS, Z_AXIS];
/** A split must leave at least this share of the region on each side. */
const MIN_SHARE = 0.22;
const ATTEMPTS = 6;

export const UNIT_BOX: Box = { min: [-1, -1, -1], max: [1, 1, 1] };

export function cellVolume(cell: readonly Face[]): number {
  if (cell.length === 0) return 0;
  const apex = centroid(cell.flatMap((f) => [...f.points]));
  return cell.reduce((v, f) => {
    const base = centroid(f.points);
    return v + Math.abs(dot(polygonAreaVector(f.points), f.plane.n) * (dot(f.plane.n, base) - dot(f.plane.n, apex))) / 3;
  }, 0);
}

export const regionVolume = (skin: readonly BoundPlane[], bounds: readonly BoundPlane[]): number => cellVolume(buildCell([...skin, ...bounds]));

/** The half-space on one side of the slot centred on dot(n, p) = d, `width` wide. */
export function side(n: Vec3, d: number, width: number, keepLow: boolean): BoundPlane {
  return keepLow ? { n, d: d - width / 2, kind: 'cut' } : { n: scale(n, -1), d: -d - width / 2, kind: 'cut' };
}

const random = (seed: number, path: string, salt: number): number => {
  let h = seed * 97.13 + salt * 13.7;
  for (let i = 0; i < path.length; i += 1) h = h * 1.013 + path.charCodeAt(i) * 7.31;
  return hash1(h);
};

export function toVec3(value: readonly number[]): Vec3 {
  const [x, y, z] = value;
  if (value.length !== 3 || x === undefined || y === undefined || z === undefined) {
    throw new Error(`Split planes: expected a 3-component point, got ${value.length} components`);
  }
  return [x, y, z];
}

function splitBox(box: Box, axis: number, at: number): [Box, Box] {
  const lowMax = box.max.map((v, i) => (i === axis ? at : v));
  const highMin = box.min.map((v, i) => (i === axis ? at : v));
  return [
    { min: box.min, max: toVec3(lowMax) },
    { min: toVec3(highMin), max: box.max },
  ];
}

function choosePlane(seed: number, path: string, attempt: number, box: Box): { n: Vec3; d: number; axis: number | null } {
  const r = (salt: number): number => random(seed, path, attempt * 10 + salt);
  const extents = [0, 1, 2].map((i) => (box.max[i] ?? 0) - (box.min[i] ?? 0));
  const longest = extents.indexOf(Math.max(...extents));
  const axis = r(1) < 0.25 ? Math.floor(r(2) * 3) : longest;
  const share = 0.38 + 0.24 * r(3);
  const at = (box.min[axis] ?? 0) + (extents[axis] ?? 0) * share;
  const along = AXES[axis] ?? X_AXIS;
  if (r(4) < 0.62) return { n: along, d: at, axis };
  const other = AXES[(axis + 1 + Math.floor(r(5) * 2)) % 3] ?? Y_AXIS;
  const n = normalize(add(along, scale(other, r(6) < 0.5 ? 0.5 : -0.5)));
  const mid = scale(add(box.min, box.max), 0.5);
  const through = toVec3(mid.map((c, i) => (i === axis ? at : c)));
  return { n, d: dot(n, through), axis: null };
}

export interface Region {
  readonly path: string;
  readonly bounds: readonly BoundPlane[];
  readonly box: Box;
  readonly volume: number;
}

export interface SplitContext {
  readonly skin: readonly BoundPlane[];
  readonly seed: number;
  readonly width: number;
}

/** Splits a region in two, or returns null when no seeded plane leaves both sides a fair share. */
export function trySplit(region: Region, context: SplitContext): [Region, Region] | null {
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    const plane = choosePlane(context.seed, region.path, attempt, region.box);
    const low = [...region.bounds, side(plane.n, plane.d, context.width, true)];
    const high = [...region.bounds, side(plane.n, plane.d, context.width, false)];
    const lowVolume = regionVolume(context.skin, low);
    const highVolume = regionVolume(context.skin, high);
    if (Math.min(lowVolume, highVolume) < MIN_SHARE * region.volume) continue;
    const [lowBox, highBox]: [Box, Box] = plane.axis === null ? [region.box, region.box] : splitBox(region.box, plane.axis, plane.d);
    return [
      { path: `${region.path}0`, bounds: low, box: lowBox, volume: lowVolume },
      { path: `${region.path}1`, bounds: high, box: highBox, volume: highVolume },
    ];
  }
  return null;
}
