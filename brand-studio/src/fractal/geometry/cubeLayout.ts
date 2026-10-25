import type { BoundPlane } from '../../monolith/geometry/convexCell';
import type { FractalLayout } from './fractalLayout';
import { regionVolume, trySplit, UNIT_BOX, type Region } from './splitPlanes';

/**
 * One cube, no fractal: broken into exactly `count` elements (when the geometry allows) by always
 * splitting the largest remaining element, so pieces stay even at any count.
 */
export interface CubeParams {
  readonly seed: number;
  readonly count: number;
  readonly cutWidth: number;
  readonly bevel: number;
}

export const CUBE_COUNT = { min: 2, max: 48 } as const;

export function cubeLayout(params: CubeParams, skin: readonly BoundPlane[]): FractalLayout {
  if (!Number.isInteger(params.count) || params.count < CUBE_COUNT.min || params.count > CUBE_COUNT.max) {
    throw new Error(`Cube layout needs ${CUBE_COUNT.min}–${CUBE_COUNT.max} whole elements (got ${params.count})`);
  }
  const context = { skin, seed: params.seed, width: params.cutWidth };
  const regions: Region[] = [{ path: 'C', bounds: [], box: UNIT_BOX, volume: regionVolume(skin, []) }];
  const settled = new Set<string>();
  while (regions.length < params.count) {
    const open = regions.filter((r) => !settled.has(r.path));
    if (open.length === 0) break;
    const largest = open.reduce((a, b) => (b.volume > a.volume ? b : a));
    const halves = trySplit(largest, context);
    if (halves === null) {
      settled.add(largest.path);
      continue;
    }
    regions.splice(regions.indexOf(largest), 1, ...halves);
  }
  return {
    leaves: regions.map((r) => ({ id: r.path, level: 0, planes: r.bounds })),
    frames: [{ level: 0, center: [0, 0, 0], half: 1 }],
    carvingCorners: [],
  };
}
