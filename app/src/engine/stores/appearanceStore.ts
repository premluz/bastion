import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  THEME_FOR_APPEARANCE, appearanceFromMessage, appearanceFromSearch, type Appearance,
} from '../appearance';

interface AppearanceState {
  appearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
}

// The user's choice persists like the other device preferences. A `?theme=` in the
// URL, or a message from a host page, overrides it for the session (see
// startAppearance) — an embedded frame follows its host, not what was saved.
export const useAppearanceStore = create<AppearanceState>()(persist((set) => ({
  appearance: 'dark',
  setAppearance: (appearance) => set({ appearance }),
}), { name: 'bastion-appearance' }));

const apply = (appearance: Appearance) =>
  document.documentElement.setAttribute('data-theme', THEME_FOR_APPEARANCE[appearance]);

/** Applies the appearance and keeps it in step with the store, the URL and host messages. Call once, before render. */
export function startAppearance() {
  const requested = appearanceFromSearch(window.location.search);
  if (requested) useAppearanceStore.getState().setAppearance(requested);
  apply(useAppearanceStore.getState().appearance);
  useAppearanceStore.subscribe((state) => apply(state.appearance));
  // Any origin may ask: the message can only choose between the two themes.
  window.addEventListener('message', (event) => {
    const appearance = appearanceFromMessage(event.data);
    if (appearance) useAppearanceStore.getState().setAppearance(appearance);
  });
}
