import type { MonolithModel } from '../geometry/types';
import { add, cross, dot, length, normalize, scale, sub, type Vec3 } from '../geometry/vec';
import { PHASE, smootherstep, window01 } from './timeline';

export interface PieceMotion {
  /** Dormant displacement from the assembled position. */
  readonly offset: Vec3;
  readonly axis: Vec3;
  /** Dormant rotation about the piece's centroid, radians. */
  readonly angle: number;
  readonly pivot: Vec3;
  readonly delay: number;
}

export interface PieceTransform {
  readonly translation: Vec3;
  readonly axis: Vec3;
  readonly angle: number;
  readonly pivot: Vec3;
  /** 1 while dormant and apart, 0 once seated — exposed walls dim as they open. */
  readonly openness: number;
}

const SEPARATION = 0.24;
const DORMANT_TILT = 0.04;
const MAX_STAGGER = 0.07;
/** Rotation settles within this share of a piece's travel, so the last approach is pure translation. */
const ROTATION_SHARE = 0.65;

/**
 * Radial drift with every component that points into one of the piece's own slot walls removed,
 * so each piece only ever moves away from its neighbours — whatever their timing.
 */
function escapeDirection(centroid: Vec3, wallNormals: readonly Vec3[], id: string): Vec3 {
  let d: Vec3 = length(centroid) < 0.05 ? [0, 1, 0] : normalize(centroid);
  for (let pass = 0; pass < 8; pass += 1) {
    for (const n of wallNormals) {
      const into = dot(d, n);
      if (into > 0) d = sub(d, scale(n, into));
    }
  }
  if (length(d) < 0.05) throw new Error(`Piece "${id}" has no free direction to separate along`);
  return normalize(d);
}

export function pieceMotions(model: MonolithModel): PieceMotion[] {
  const order = model.pieces
    .map((piece, index) => ({ index, height: piece.centroid[1] }))
    .sort((a, b) => a.height - b.height)
    .map((entry) => entry.index);
  const denominator = Math.max(1, model.pieces.length - 1);

  return model.pieces.map((piece, index) => {
    const direction = escapeDirection(piece.centroid, piece.walls.map((w) => w.normal), piece.id);
    const sideways = cross(direction, [0, 1, 0]);
    const axis: Vec3 = length(sideways) < 0.1 ? [1, 0, 0] : normalize(sideways);
    return {
      offset: scale(direction, SEPARATION),
      axis,
      angle: DORMANT_TILT * (index % 2 === 0 ? 1 : -1),
      pivot: piece.centroid,
      delay: (order.indexOf(index) / denominator) * MAX_STAGGER,
    };
  });
}

export function pieceTransform(motion: PieceMotion, progress: number): PieceTransform {
  const start = PHASE.alignStart + motion.delay;
  const end = PHASE.alignEnd - (MAX_STAGGER - motion.delay);
  const u = window01(progress, start, end);
  const travel = smootherstep(u);
  const turn = smootherstep(u / ROTATION_SHARE);
  return {
    translation: scale(motion.offset, 1 - travel),
    axis: motion.axis,
    angle: motion.angle * (1 - turn),
    pivot: motion.pivot,
    openness: 1 - travel,
  };
}

/** Rodrigues rotation about the pivot, then translation — the same transform the scene applies. */
export function applyTransform(t: PieceTransform, p: Vec3): Vec3 {
  const v = sub(p, t.pivot);
  const c = Math.cos(t.angle);
  const s = Math.sin(t.angle);
  const rotated = add(add(scale(v, c), scale(cross(t.axis, v), s)), scale(t.axis, dot(t.axis, v) * (1 - c)));
  return add(add(rotated, t.pivot), t.translation);
}
