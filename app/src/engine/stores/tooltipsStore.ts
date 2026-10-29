import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TooltipsState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const DISABLED_ATTRIBUTE = 'data-tooltips-disabled';

export const useTooltipsStore = create<TooltipsState>()(persist((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
}), { name: 'bastion-tooltips' }));

const applyPreference = (enabled: boolean) => {
  if (enabled) document.documentElement.removeAttribute(DISABLED_ATTRIBUTE);
  else document.documentElement.setAttribute(DISABLED_ATTRIBUTE, '');
};

/** Applies the saved preference before render and keeps the document in sync with the setting. */
export function startTooltips() {
  applyPreference(useTooltipsStore.getState().enabled);
  useTooltipsStore.subscribe((state) => applyPreference(state.enabled));
}
