import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShowTouchesState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

// "Show touches" demo aid (Settings): a device preference, not an account
// one, persisted so it survives reloads between recording takes.
export const useShowTouchesStore = create<ShowTouchesState>()(persist((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
}), { name: 'bastion-show-touches' }));
