import { create } from "zustand";
import { useArtifactStore } from "./artifactStore";

export const PAGES = ["home", "investigations", "entities", "watchlist", "data-sources", "market-pulse"] as const;
export type Page = (typeof PAGES)[number];

function isPage(value: string): value is Page {
  return (PAGES as readonly string[]).includes(value);
}

function readHashPage(): Page {
  const hash = window.location.hash.replace(/^#/, "");
  return isPage(hash) ? hash : "home";
}

interface PageState {
  page: Page;
  // Transient, one-shot: which module the Investigations page should
  // scroll to on its next mount/view-switch (the notification bell's
  // "focus Monitor" action). InvestigationsPage clears it after reading
  // it — not page state itself, so it never re-triggers on an unrelated
  // re-render.
  focusModule: string | null;
  setPage: (page: Page) => void;
  navigateToModule: (module: string) => void;
  clearFocusModule: () => void;
}

// No router dependency (CLAUDE.md §5's closed list has none) — a plain
// page enum plus an optional location.hash sync, read once at store
// init and written on every navigation. No popstate listener: back/
// forward-button support isn't part of this order's scope, and the app
// only ever runs inside Storybook's iframe today (no main.tsx/index.html
// until Phase 10) — the hash lives on the iframe's own location, never
// colliding with Storybook's own ?id=/&globals= query params.
export const usePageStore = create<PageState>((set) => ({
  page: readHashPage(),
  focusModule: null,
  // Home is the only "investigation" place (it's where a turn's own
  // transcript/trail actually lives) — every other place is a browsable
  // index (routing law: "pages never host scene renders"), so an artifact
  // left open there reads as stale context once you've navigated away.
  // Closing (not clearing) it here: opening an artifact from within a
  // place page without a page change — Market Pulse's reopen, Entities/
  // Watchlist's Investigate — never touches setPage, so those stay
  // unaffected by this, per the standing ruling that the stack is global.
  setPage: (page) => {
    window.location.hash = page === "home" ? "" : page;
    if (page !== "home") useArtifactStore.getState().closeStack();
    set({ page });
  },
  navigateToModule: (module) => {
    window.location.hash = "investigations";
    useArtifactStore.getState().closeStack();
    set({ page: "investigations", focusModule: module });
  },
  clearFocusModule: () => set({ focusModule: null }),
}));
