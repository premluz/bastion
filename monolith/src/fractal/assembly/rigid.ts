import { add, cross, dot, scale, sub, type Vec3 } from '../../monolith/geometry/vec';

/** Unit quaternion [x, y, z, w]. */
export type Quat = readonly [number, number, number, number];

export const IDENTITY_QUAT: Quat = [0, 0, 0, 1];

export function quatFromAxisAngle(axis: Vec3, angle: number): Quat {
  const s = Math.sin(angle / 2);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];
}

export function quatMultiply(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

export function rotate(q: Quat, v: Vec3): Vec3 {
  const u: Vec3 = [q[0], q[1], q[2]];
  const t = scale(cross(u, v), 2);
  return add(add(v, scale(t, q[3])), cross(u, t));
}

/** p' = scale · rotation(p) + translation — the same order three.js applies to a group. */
export interface Rigid {
  readonly rotation: Quat;
  readonly translation: Vec3;
  readonly scale: number;
}

export const IDENTITY: Rigid = { rotation: IDENTITY_QUAT, translation: [0, 0, 0], scale: 1 };

export const applyRigid = (r: Rigid, p: Vec3): Vec3 => add(scale(rotate(r.rotation, p), r.scale), r.translation);

/** (a ∘ b)(p) = a(b(p)). */
export function compose(a: Rigid, b: Rigid): Rigid {
  return {
    rotation: quatMultiply(a.rotation, b.rotation),
    translation: applyRigid(a, b.translation),
    scale: a.scale * b.scale,
  };
}

/** Rotate and scale about `pivot`, then move by `offset`. */
export function aboutPivot(rotation: Quat, pivot: Vec3, offset: Vec3, factor = 1): Rigid {
  const moved = scale(rotate(rotation, pivot), factor);
  return { rotation, translation: add(sub(pivot, moved), offset), scale: factor };
}

export const quatAngle = (q: Quat): number => 2 * Math.acos(Math.min(1, Math.abs(q[3])));
export const quatDot = (a: Quat, b: Quat): number => dot([a[0], a[1], a[2]], [b[0], b[1], b[2]]) + a[3] * b[3];
