import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { PieceModel, Polygon } from './types';

const SKIN_GROUP = 0;
const WALL_GROUP = 1;

function appendFan(polygon: Polygon, positions: number[], normals: number[]): number {
  const [first, ...rest] = polygon.points;
  if (first === undefined) return 0;
  let vertices = 0;
  for (let i = 0; i < rest.length - 1; i += 1) {
    const b = rest[i];
    const c = rest[i + 1];
    if (b === undefined || c === undefined) continue;
    positions.push(...first, ...b, ...c);
    normals.push(...polygon.normal, ...polygon.normal, ...polygon.normal);
    vertices += 3;
  }
  return vertices;
}

/** Flat-shaded triangles: group 0 is the exterior skin, group 1 the slot walls. */
export function pieceGeometry(piece: PieceModel): BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const skinCount = piece.outer.reduce((n, polygon) => n + appendFan(polygon, positions, normals), 0);
  const wallCount = piece.walls.reduce((n, polygon) => n + appendFan(polygon, positions, normals), 0);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.addGroup(0, skinCount, SKIN_GROUP);
  geometry.addGroup(skinCount, wallCount, WALL_GROUP);
  geometry.computeBoundingSphere();
  return geometry;
}
