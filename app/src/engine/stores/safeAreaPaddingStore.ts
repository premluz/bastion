import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SafeAreaPaddingState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const SAFE_AREA_ATTRIBUTE = 'data-safe-area-padding';

export const useSafeAreaPaddingStore = create<SafeAreaPaddingState>()(persist((set) => ({
  enabled: true,
  setEnabled: (enabled) => set({ enabled }),
}), { name: 'bastion-safe-area-padding' }));

const applyPreference = (enabled: boolean) => {
  if (enabled) document.documentElement.removeAttribute(SAFE_AREA_ATTRIBUTE);
  else document.documentElement.setAttribute(SAFE_AREA_ATTRIBUTE, 'off');
};

/** Applies the saved safe-area setting before render and keeps it in sync with Settings. */
export function startSafeAreaPadding() {
  applyPreference(useSafeAreaPaddingStore.getState().enabled);
  useSafeAreaPaddingStore.subscribe((state) => applyPreference(state.enabled));
}
