import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SubtleCentsState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const SUBTLE_CENTS_ATTRIBUTE = 'data-subtle-cents';

export const useSubtleCentsStore = create<SubtleCentsState>()(persist((set) => ({
  enabled: true,
  setEnabled: (enabled) => set({ enabled }),
}), { name: 'bastion-subtle-cents' }));

const applyPreference = (enabled: boolean) => {
  if (enabled) document.documentElement.removeAttribute(SUBTLE_CENTS_ATTRIBUTE);
  else document.documentElement.setAttribute(SUBTLE_CENTS_ATTRIBUTE, 'off');
};

/** Applies the saved cents setting before render and keeps it in sync with Settings. */
export function startSubtleCents() {
  applyPreference(useSubtleCentsStore.getState().enabled);
  useSubtleCentsStore.subscribe((state) => applyPreference(state.enabled));
}
