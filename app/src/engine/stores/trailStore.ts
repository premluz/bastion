import { create } from "zustand";
import type { ThinkingStep } from "../../contracts/thinking";

interface TrailState {
  steps: ThinkingStep[];
  activeIndex: number;
  isComplete: boolean;
  elapsedMs: number;
  skip: (() => void) | null;
}

interface TrailActions {
  start: (steps: ThinkingStep[], skip: () => void) => void;
  setActiveIndex: (index: number, elapsedMs: number) => void;
  finish: (elapsedMs: number) => void;
  clear: () => void;
}

const idle: TrailState = { steps: [], activeIndex: -1, isComplete: false, elapsedMs: 0, skip: null };

export const useTrailStore = create<TrailState & TrailActions>((set) => ({
  ...idle,
  start: (steps, skip) => set({ steps, activeIndex: -1, isComplete: false, elapsedMs: 0, skip }),
  setActiveIndex: (activeIndex, elapsedMs) => set({ activeIndex, elapsedMs }),
  finish: (elapsedMs) => set({ isComplete: true, elapsedMs, skip: null }),
  clear: () => set({ ...idle }),
}));
