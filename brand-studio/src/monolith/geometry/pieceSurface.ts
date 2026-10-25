import type { Face } from './convexCell';
import { signedDistance, splitPolygon } from './polygon';
import { dot, polygonArea, type Vec3 } from './vec';

const SLIVER_AREA = 1e-9;

/**
 * Removes the part of a face that lies inside (or on the boundary of) another cell of the same piece.
 * When both cells share the same outward-facing plane, `otherWins` decides which copy survives.
 */
function subtractCell(points: readonly Vec3[], faceNormal: Vec3, cell: readonly Face[], otherWins: boolean): Vec3[][] {
  const kept: Vec3[][] = [];
  let rest: readonly Vec3[] = points;
  for (const face of cell) {
    const plane = face.plane;
    const coplanar = rest.every((p) => signedDistance(plane, p) === 0);
    if (coplanar) {
      if (dot(plane.n, faceNormal) > 0 && !otherWins) return [[...points]];
      continue;
    }
    const { inside, outside } = splitPolygon(rest, plane);
    if (outside.length >= 3 && polygonArea(outside) > SLIVER_AREA) kept.push(outside);
    rest = inside;
    if (rest.length < 3) return kept;
  }
  return kept;
}

export interface SurfaceFace {
  readonly points: readonly Vec3[];
  readonly face: Face;
}

/** The exposed surface of a union of overlapping convex cells. */
export function exposedFaces(cells: readonly (readonly Face[])[]): SurfaceFace[] {
  const surface: SurfaceFace[] = [];
  cells.forEach((cell, i) => {
    for (const face of cell) {
      let polys: Vec3[][] = [[...face.points]];
      cells.forEach((other, j) => {
        if (j === i) return;
        polys = polys.flatMap((poly) => subtractCell(poly, face.plane.n, other, j < i));
      });
      for (const points of polys) {
        if (polygonArea(points) > SLIVER_AREA) surface.push({ points, face });
      }
    }
  });
  return surface;
}
