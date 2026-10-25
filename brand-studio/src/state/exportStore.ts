import { create } from 'zustand';

export type ExportKind = 'png' | 'svg';

interface ExportState {
  /** An export waiting for the next rendered frame. */
  readonly pending: ExportKind | null;
  readonly request: (kind: ExportKind) => void;
  readonly take: () => ExportKind | null;
}

export const useExport = create<ExportState>((set, get) => ({
  pending: null,
  request: (kind) => set({ pending: kind }),
  take: () => {
    const kind = get().pending;
    if (kind !== null) set({ pending: null });
    return kind;
  },
}));
