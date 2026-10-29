import type { MonolithModel } from '../../monolith/geometry/types';
import type { FractalModel } from './buildFractal';

/** Keep the brand geometry and its light sources while using the single-cube search motion. */
export function monolithCube(model: MonolithModel): FractalModel {
  return {
    pieces: model.pieces.map((piece) => ({ model: piece, level: 0 })),
    frames: [{ level: 0, center: [0, 0, 0], half: 1 }],
    junctions: model.junctions,
    agentCore: null,
  };
}
