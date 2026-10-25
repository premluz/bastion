import { create } from 'zustand';
import { clamp01 } from '@bastion/monolith';

interface AssemblyState {
  /** 0 = dormant, 1 = assembled. The only source of truth for every piece and light state. */
  readonly progress: number;
  readonly playing: boolean;
  readonly direction: 1 | -1;
  /** Seconds for a full 0 → 1 run. */
  readonly duration: number;
  readonly play: () => void;
  readonly pause: () => void;
  readonly reverse: () => void;
  readonly replay: () => void;
  readonly scrub: (progress: number) => void;
  readonly setDuration: (seconds: number) => void;
  readonly advance: (deltaSeconds: number) => void;
}

export const useAssembly = create<AssemblyState>((set, get) => ({
  progress: 0,
  playing: false,
  direction: 1,
  duration: 9,
  play: () => {
    const { progress, direction } = get();
    const atEnd = direction === 1 ? progress >= 1 : progress <= 0;
    set({ playing: true, ...(atEnd ? { progress: direction === 1 ? 0 : 1 } : {}) });
  },
  pause: () => set({ playing: false }),
  reverse: () => set((s) => ({ direction: s.direction === 1 ? -1 : 1, playing: true })),
  replay: () => set({ progress: 0, direction: 1, playing: true }),
  scrub: (progress) => set({ progress: clamp01(progress), playing: false }),
  setDuration: (duration) => set({ duration }),
  advance: (deltaSeconds) => {
    const { progress, direction, duration, playing } = get();
    if (!playing) return;
    const next = clamp01(progress + (direction * deltaSeconds) / duration);
    const finished = direction === 1 ? next >= 1 : next <= 0;
    set({ progress: next, playing: !finished });
  },
}));
