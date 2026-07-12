import { create } from "zustand";
import type { HydratedScene } from "../../contracts/scene";

interface SceneState {
  activeScene: HydratedScene | null;
  setActiveScene: (scene: HydratedScene | null) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  activeScene: null,
  setActiveScene: (scene) => set({ activeScene: scene }),
}));
