import { create } from 'zustand';

interface FractalState {
  /** Fractal levels below the whole monolith. */
  readonly levels: number;
  /** Recursive splits per region; more means finer pieces. */
  readonly granularity: number;
  /** Wrong orientations a piece tries before the right one. */
  readonly trials: number;
  readonly seed: number;
  readonly set: (patch: Partial<Pick<FractalState, 'levels' | 'granularity' | 'trials' | 'seed'>>) => void;
}

export const useFractal = create<FractalState>((set) => ({
  levels: 2,
  granularity: 2,
  trials: 2,
  seed: 7,
  set: (patch) => set(patch),
}));
