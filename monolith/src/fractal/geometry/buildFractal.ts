import { assemblePiece, skinPlanes } from '../../monolith/geometry/buildMonolith';
import { buildCell } from '../../monolith/geometry/convexCell';
import type { PieceModel } from '../../monolith/geometry/types';
import { scale, type Vec3 } from '../../monolith/geometry/vec';
import type { JunctionMap } from '../../monolith/intelligence/junctions';
import { MAX_OPENINGS } from '../../monolith/limits';
import { cubeLayout, type CubeParams } from './cubeLayout';
import { fractalLayout, type FractalLayout, type FractalParams, type LevelFrame } from './fractalLayout';

export interface FractalPiece {
  readonly model: PieceModel;
  /** The fractal level this piece belongs to; level 1 and deeper together form the deployable agent. */
  readonly level: number;
}

export interface FractalModel {
  readonly pieces: readonly FractalPiece[];
  readonly frames: readonly LevelFrame[];
  readonly junctions: JunctionMap;
  /**
   * The agent cube's own heart (its centre): once independent its light gathers here, away from its
   * outer faces. Null for a single cube, which deploys nothing.
   */
  readonly agentCore: Vec3 | null;
}

function frameAt(frames: readonly LevelFrame[], level: number): LevelFrame {
  const frame = frames.find((f) => f.level === level);
  if (frame === undefined) throw new Error(`Fractal model has no frame for level ${level}`);
  return frame;
}

/**
 * Junctions follow the fractal: the carving corner of every level (where three cuts meet) and the
 * centre of each level's cube, so the intelligence travels along the chain of nested cubes.
 */
function junctionsOf(frames: readonly LevelFrame[], corners: readonly Vec3[]): JunctionMap {
  const inside = (p: Vec3): boolean => Math.max(...p.map(Math.abs)) < 0.9;
  const points = [...corners, ...frames.filter((f) => f.level > 0).map((f) => f.center)].filter(inside);
  const core = corners[0] ?? frames[0]?.center ?? [0, 0, 0];
  return { junctions: points.length > 0 ? points : [core], core };
}

/** A single cube's intelligence wanders between its pieces, drawn a little towards the centre. */
function pieceJunctions(pieces: readonly FractalPiece[]): JunctionMap {
  const points = pieces.slice(0, 10).map((p) => scale(p.model.centroid, 0.7));
  return { junctions: points.length > 0 ? points : [[0, 0, 0]], core: [0, 0, 0] };
}

function buildPieces(layout: FractalLayout, skin: ReturnType<typeof skinPlanes>): FractalPiece[] {
  return layout.leaves.map((leaf) => {
    const cell = buildCell([...skin, ...leaf.planes]);
    if (cell.length === 0) throw new Error(`Fractal piece ${leaf.id} is empty`);
    const model = assemblePiece(`fractal/${leaf.id}`, leaf.id, [cell], skin);
    if (model.openings.length > MAX_OPENINGS) {
      throw new Error(`Fractal piece ${leaf.id} has ${model.openings.length} slot openings; the shader holds ${MAX_OPENINGS}`);
    }
    return { model, level: leaf.level };
  });
}

export function buildFractal(params: FractalParams): FractalModel {
  const skin = skinPlanes(params.bevel, params.round ?? 0);
  const layout = fractalLayout(params, skin);
  const pieces = buildPieces(layout, skin);
  const agentCore = frameAt(layout.frames, 1).center;
  return { pieces, frames: layout.frames, junctions: junctionsOf(layout.frames, layout.carvingCorners), agentCore };
}

export function buildCube(params: CubeParams): FractalModel {
  const skin = skinPlanes(params.bevel, params.round ?? 0);
  const layout = cubeLayout(params, skin);
  const pieces = buildPieces(layout, skin);
  return { pieces, frames: layout.frames, junctions: pieceJunctions(pieces), agentCore: null };
}
