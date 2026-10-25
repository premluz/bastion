export type Vec3 = readonly [number, number, number];

export const EPS = 1e-7;

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const length = (a: Vec3): number => Math.sqrt(dot(a, a));
export const lerp = (a: Vec3, b: Vec3, t: number): Vec3 => add(a, scale(sub(b, a), t));

export function normalize(a: Vec3): Vec3 {
  const len = length(a);
  if (len < EPS) throw new Error(`Cannot normalize a zero-length vector [${a.join(', ')}]`);
  return scale(a, 1 / len);
}

export function centroid(points: readonly Vec3[]): Vec3 {
  if (points.length === 0) throw new Error('Centroid of an empty point set is undefined');
  const sum = points.reduce<Vec3>((acc, p) => add(acc, p), [0, 0, 0]);
  return scale(sum, 1 / points.length);
}

/** Vector area of a planar polygon; its length is the polygon's area. */
export function polygonAreaVector(points: readonly Vec3[]): Vec3 {
  let acc: Vec3 = [0, 0, 0];
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    if (a === undefined || b === undefined) continue;
    acc = add(acc, cross(a, b));
  }
  return scale(acc, 0.5);
}

export const polygonArea = (points: readonly Vec3[]): number => length(polygonAreaVector(points));
