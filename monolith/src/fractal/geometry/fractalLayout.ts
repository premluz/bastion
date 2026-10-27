import type { BoundPlane } from '../../monolith/geometry/convexCell';
import { add, type Vec3 } from '../../monolith/geometry/vec';
import { regionVolume, side, trySplit, X_AXIS, Y_AXIS, Z_AXIS, type Box, type Region, type SplitContext } from './splitPlanes';

/**
 * A self-similar break-up of the monolith. At every fractal level three axis cuts carve a corner cube
 * (the next level, a miniature of the whole) out of the current one; the three regions around it are
 * split recursively by the brand's own cut vocabulary — flat seams and shallow diagonals. Choices are
 * seeded by each region's path relative to its level, so every level repeats the same pattern.
 */
export interface FractalParams {
  readonly seed: number;
  /** Fractal levels below the whole monolith (1–3). */
  readonly levels: number;
  /** Recursive splits per region (1–3); each adds up to twice the pieces. */
  readonly granularity: number;
  readonly cutWidth: number;
  readonly bevel: number;
  /** Soft corners' radius; 0 or absent keeps the micro-bevel. */
  readonly round?: number;
}

export interface LevelFrame {
  readonly level: number;
  readonly center: Vec3;
  readonly half: number;
}

export interface LeafSpec {
  readonly id: string;
  /** The fractal level whose cube this piece belongs to (not a deeper corner). */
  readonly level: number;
  readonly planes: readonly BoundPlane[];
}

export interface FractalLayout {
  readonly leaves: readonly LeafSpec[];
  readonly frames: readonly LevelFrame[];
  /** Where the three carving planes of each level meet — the structure's junctions. */
  readonly carvingCorners: readonly Vec3[];
}

/** Each corner cube's edge as a share of its parent's. */
export const CORNER_RATIO = 0.46;

class LayoutBuilder {
  readonly leaves: LeafSpec[] = [];
  readonly frames: LevelFrame[] = [];
  readonly corners: Vec3[] = [];

  constructor(private readonly params: FractalParams, private readonly skin: readonly BoundPlane[]) {}

  carve(level: number, center: Vec3, half: number, bounds: readonly BoundPlane[]): void {
    this.frames.push({ level, center, half });
    const context: SplitContext = { skin: this.skin, seed: this.params.seed, width: this.params.cutWidth * CORNER_RATIO ** level };
    const box: Box = { min: add(center, [-half, -half, -half]), max: add(center, [half, half, half]) };
    if (level === this.params.levels) {
      this.split(level, this.region('L', bounds, box), this.params.granularity + 1, context);
      return;
    }
    const inner = half * CORNER_RATIO;
    const [X = 0, Y = 0, Z = 0] = center.map((c) => c + half - 2 * inner);
    this.corners.push([X, Y, Z]);
    const w = context.width;
    const east = [...bounds, side(X_AXIS, X, w, false)];
    const high = [...east, side(Y_AXIS, Y, w, false)];
    const regions: Region[] = [
      this.region('W', [...bounds, side(X_AXIS, X, w, true)], { min: box.min, max: [X, box.max[1], box.max[2]] }),
      this.region('S', [...east, side(Y_AXIS, Y, w, true)], { min: [X, box.min[1], box.min[2]], max: [box.max[0], Y, box.max[2]] }),
      this.region('B', [...high, side(Z_AXIS, Z, w, true)], { min: [X, Y, box.min[2]], max: [box.max[0], box.max[1], Z] }),
    ];
    for (const region of regions) this.split(level, region, this.params.granularity, context);
    this.carve(level + 1, add(center, [half - inner, half - inner, half - inner]), inner, [...high, side(Z_AXIS, Z, w, false)]);
  }

  private region(path: string, bounds: readonly BoundPlane[], box: Box): Region {
    return { path, bounds, box, volume: regionVolume(this.skin, bounds) };
  }

  private split(level: number, region: Region, budget: number, context: SplitContext): void {
    if (region.volume <= 0) return;
    const halves = budget > 0 ? trySplit(region, context) : null;
    if (halves === null) {
      this.leaves.push({ id: `L${level}${region.path}`, level, planes: region.bounds });
      return;
    }
    for (const half of halves) this.split(level, half, budget - 1, context);
  }
}

export function fractalLayout(params: FractalParams, skin: readonly BoundPlane[]): FractalLayout {
  if (params.levels < 1 || params.granularity < 0) throw new Error(`Fractal layout needs at least one level (got ${params.levels})`);
  const builder = new LayoutBuilder(params, skin);
  builder.carve(0, [0, 0, 0], 1, []);
  return { leaves: builder.leaves, frames: builder.frames, carvingCorners: builder.corners };
}
