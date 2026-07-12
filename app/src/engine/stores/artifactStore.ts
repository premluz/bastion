import { create } from "zustand";
import type { HydratedScene } from "../../contracts/scene";

export interface Artifact {
  scene: HydratedScene;
  module: string;
}

// Past turns' scenes live here, keyed by artifact id — the fix for the
// single-slot sceneStore.activeScene design (Phase 8B WO-1 root cause,
// see STATE.md): a turn's artifact is registered once and never
// overwritten by a later turn. `openArtifactId` is which one Canvas
// currently shows; ArtifactCard's onClick (WO-2) changes it.
interface ArtifactState {
  artifacts: Record<string, Artifact>;
  openArtifactId: string | null;
  registerArtifact: (id: string, artifact: Artifact) => void;
  setOpenArtifact: (id: string | null) => void;
}

export const useArtifactStore = create<ArtifactState>((set) => ({
  artifacts: {},
  openArtifactId: null,
  registerArtifact: (id, artifact) => set((state) => ({ artifacts: { ...state.artifacts, [id]: artifact } })),
  setOpenArtifact: (id) => set({ openArtifactId: id }),
}));
