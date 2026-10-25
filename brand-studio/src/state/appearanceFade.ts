import { create } from 'zustand';
import { useStudio, type Appearance } from './studioStore';

interface FadeState {
  /** An appearance waiting for the next rendered frame, so the old look can be kept for the crossfade. */
  readonly pending: Appearance | null;
  /** The old frame, fading out over the new look. */
  readonly bitmap: ImageBitmap | null;
  readonly token: number;
  readonly request: (next: Appearance) => void;
  /** The pending change — held back while a fade is still running, so fades never stack. */
  readonly take: () => Appearance | null;
  readonly begin: (bitmap: ImageBitmap) => void;
  readonly clear: () => void;
}

const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const useAppearanceFade = create<FadeState>((set, get) => ({
  pending: null,
  bitmap: null,
  token: 0,
  request: (next) => {
    if (prefersReducedMotion()) {
      useStudio.getState().setAppearance(next);
      return;
    }
    set({ pending: next });
  },
  take: () => {
    const { pending, bitmap } = get();
    if (pending === null || bitmap !== null) return null;
    set({ pending: null });
    return pending;
  },
  begin: (bitmap) => set((s) => ({ bitmap, token: s.token + 1 })),
  clear: () => {
    get().bitmap?.close();
    set({ bitmap: null });
  },
}));
