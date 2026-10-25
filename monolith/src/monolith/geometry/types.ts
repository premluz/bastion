import type { JunctionMap } from '../intelligence/junctions';
import type { BoundSpec } from './bounds';
import type { Face } from './convexCell';
import type { Vec3 } from './vec';

export type VariantId = 'step-angle' | 'angular-slide-a' | 'angular-slide-b' | 'double-straight' | 'chevron-slip';

export interface PieceSpec {
  readonly id: string;
  /** Overlapping convex cells whose union is the piece. */
  readonly cells: readonly (readonly BoundSpec[])[];
}

export interface VariantSpec {
  readonly id: VariantId;
  readonly code: string;
  readonly name: string;
  readonly pieces: readonly PieceSpec[];
}

export interface Polygon {
  readonly points: readonly Vec3[];
  readonly normal: Vec3;
}

export type Segment = readonly [Vec3, Vec3];

export interface PieceModel {
  readonly id: string;
  readonly cells: readonly (readonly Face[])[];
  readonly outer: readonly Polygon[];
  /** Slot walls facing the cut. */
  readonly walls: readonly Polygon[];
  /** Where slot walls meet the exterior skin — the source of the subsurface glow. */
  readonly openings: readonly Segment[];
  readonly centroid: Vec3;
}

export interface MonolithModel {
  readonly variant: VariantId;
  readonly cutWidth: number;
  readonly pieces: readonly PieceModel[];
  readonly junctions: JunctionMap;
}
