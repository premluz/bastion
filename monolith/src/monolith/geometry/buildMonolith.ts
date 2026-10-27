import { chamferPlanes, resolveBound, roundPlanes } from './bounds';
import { buildCell, unitBox, type BoundPlane, type Face } from './convexCell';
import { findJunctions } from '../intelligence/junctions';
import { exposedFaces } from './pieceSurface';
import type { MonolithModel, PieceModel, PieceSpec, Polygon, Segment, VariantSpec } from './types';
import { add, centroid, dot, polygonArea, polygonAreaVector, scale, type Vec3 } from './vec';

export interface BuildOptions {
  readonly cutWidth: number;
  readonly bevel: number;
  /** Soft corners: the radius of the rounded edges and corners (0 keeps the micro-bevel). */
  readonly round?: number;
}

const EXPOSED_SEAM_TOLERANCE = 1e-6;

function cellVolumeCentroid(cell: readonly Face[]): { volume: number; center: Vec3 } {
  const all = cell.flatMap((f) => [...f.points]);
  const apex = centroid(all);
  let volume = 0;
  let weighted: Vec3 = [0, 0, 0];
  for (const face of cell) {
    const base = centroid(face.points);
    const v = Math.abs(dot(polygonAreaVector(face.points), face.plane.n) * (dot(face.plane.n, base) - dot(face.plane.n, apex))) / 3;
    volume += v;
    weighted = add(weighted, scale(add(scale(base, 0.75), scale(apex, 0.25)), v));
  }
  return { volume, center: volume > 0 ? scale(weighted, 1 / volume) : apex };
}

function onPlane(plane: BoundPlane, p: Vec3): boolean {
  return Math.abs(dot(plane.n, p) - plane.d) < 1e-6;
}

function openingSegments(walls: readonly Polygon[], skin: readonly BoundPlane[]): Segment[] {
  const segments: Segment[] = [];
  for (const wall of walls) {
    wall.points.forEach((a, i) => {
      const b = wall.points[(i + 1) % wall.points.length];
      if (b === undefined) return;
      if (skin.some((plane) => onPlane(plane, a) && onPlane(plane, b))) segments.push([a, b]);
    });
  }
  return segments;
}

/** The monolith's exterior: the unit cube's faces plus its micro-bevels. */
export function skinPlanes(bevel: number, round = 0): BoundPlane[] {
  return [...unitBox().map((f) => f.plane), ...(round > 0 ? roundPlanes(round) : chamferPlanes(bevel))];
}

function buildPiece(variant: VariantSpec, spec: PieceSpec, options: BuildOptions): PieceModel {
  const skin = skinPlanes(options.bevel, options.round ?? 0);
  const cells = spec.cells.map((bounds, index) => {
    const cell = buildCell([...skin, ...bounds.map((b) => resolveBound(b, options.cutWidth))]);
    if (cell.length === 0) throw new Error(`${variant.id}/${spec.id}: cell ${index} is empty`);
    return cell;
  });
  return assemblePiece(`${variant.id}/${spec.id}`, spec.id, cells, skin);
}

/** Exterior skin, slot walls, glow openings and centroid of a union of convex cells. */
export function assemblePiece(label: string, id: string, cells: readonly (readonly Face[])[], skin: readonly BoundPlane[]): PieceModel {
  const outer: Polygon[] = [];
  const walls: Polygon[] = [];
  for (const { points, face } of exposedFaces(cells)) {
    const polygon = { points, normal: face.plane.n };
    if (face.plane.kind === 'outer') outer.push(polygon);
    else if (face.plane.kind === 'cut') walls.push(polygon);
    else if (polygonArea(points) > EXPOSED_SEAM_TOLERANCE) {
      throw new Error(
        `${label}: internal seam at n=[${face.plane.n.map((v) => v.toFixed(3)).join(', ')}] d=${face.plane.d.toFixed(3)} is exposed (area ${polygonArea(points).toFixed(5)})`,
      );
    }
  }

  const masses = cells.map(cellVolumeCentroid);
  const total = masses.reduce((s, m) => s + m.volume, 0);
  const center = masses.reduce<Vec3>((acc, m) => add(acc, scale(m.center, m.volume / total)), [0, 0, 0]);

  return { id, cells, outer, walls, openings: openingSegments(walls, skin), centroid: center };
}

export function buildMonolith(variant: VariantSpec, options: BuildOptions): MonolithModel {
  const pieces = variant.pieces.map((piece) => buildPiece(variant, piece, options));
  return { variant: variant.id, cutWidth: options.cutWidth, pieces, junctions: findJunctions(variant, pieces) };
}
