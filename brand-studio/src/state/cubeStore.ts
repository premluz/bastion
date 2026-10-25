import { create } from 'zustand';

interface CubeState {
  /** How many elements the cube breaks into. */
  readonly count: number;
  /** Wrong orientations an element tries before the right one. */
  readonly trials: number;
  readonly seed: number;
  readonly set: (patch: Partial<Pick<CubeState, 'count' | 'trials' | 'seed'>>) => void;
}

export const useCube = create<CubeState>((set) => ({
  count: 12,
  trials: 2,
  seed: 7,
  set: (patch) => set(patch),
}));
