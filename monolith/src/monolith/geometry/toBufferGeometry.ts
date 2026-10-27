import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { PieceModel, Polygon } from './types';

const SKIN_GROUP = 0;
const WALL_GROUP = 1;

/** The outward normal of a cube rounded at `round`, at a point on its skin (the face normal when flat there). */
function roundedNormal(p: readonly [number, number, number], round: number, flat: readonly [number, number, number]): readonly [number, number, number] {
  const inner = 1 - round;
  const d = p.map((v) => v - Math.max(-inner, Math.min(inner, v)));
  const length = Math.hypot(d[0] ?? 0, d[1] ?? 0, d[2] ?? 0);
  return length < 1e-6 ? flat : [(d[0] ?? 0) / length, (d[1] ?? 0) / length, (d[2] ?? 0) / length];
}

function appendFan(polygon: Polygon, positions: number[], normals: number[], round = 0): number {
  const normalAt = (p: readonly [number, number, number]) => (round > 0 ? roundedNormal(p, round, polygon.normal) : polygon.normal);
  const [first, ...rest] = polygon.points;
  if (first === undefined) return 0;
  let vertices = 0;
  for (let i = 0; i < rest.length - 1; i += 1) {
    const b = rest[i];
    const c = rest[i + 1];
    if (b === undefined || c === undefined) continue;
    positions.push(...first, ...b, ...c);
    normals.push(...normalAt(first), ...normalAt(b), ...normalAt(c));
    vertices += 3;
  }
  return vertices;
}

/** Flat-shaded triangles: group 0 is the exterior skin, group 1 the slot walls. */
/** Triangles for a piece; with `round` (soft corners) the skin is shaded smooth over its rounded edges. */
export function pieceGeometry(piece: PieceModel, round = 0): BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const skinCount = piece.outer.reduce((n, polygon) => n + appendFan(polygon, positions, normals, round), 0);
  const wallCount = piece.walls.reduce((n, polygon) => n + appendFan(polygon, positions, normals), 0);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.addGroup(0, skinCount, SKIN_GROUP);
  geometry.addGroup(skinCount, wallCount, WALL_GROUP);
  geometry.computeBoundingSphere();
  return geometry;
}
