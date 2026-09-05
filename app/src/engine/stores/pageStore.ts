import { create } from "zustand";
import { useArtifactStore } from "./artifactStore";

export const PAGES = [
  "home",
  "investigations",
  "entities",
  "watchlist",
  "holdings",
  "data-sources",
  "market-pulse",
  "portfolio-dashboard",
  "risk-dashboard",
  "entity-detail",
] as const;
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
  // Which entity entity-detail is currently showing (Phase 16). Not
  // hash-encoded — this architecture has no per-page route params
  // (§5's closed list has no router), same limitation focusModule
  // already accepts. A hard reload while on entity-detail lands on an
  // honest "nothing selected" empty state rather than a crash; deep
  // linking to a specific entity isn't in this order's scope.
  selectedEntityId: string | null;
  // Transient, one-shot (Phase 20 WO-1) — same pattern as focusModule:
  // which Entity Detail tab (and optionally which item within it) an
  // Overview preview card deep-links into. EntityDetailPage clears it
  // after reading it, so it never re-triggers on an unrelated re-render.
  // Not hash-encoded, same limitation as selectedEntityId itself.
  entityDetailTarget: { tab: string; itemId?: string } | null;
  // Per-page UI state that must survive a navigate-away/navigate-back
  // round trip (direct feedback, 2026-08-30: "back browser button from
  // entity to portfolio should remember scroll position and tab selected
  // of discover") — a page component fully UNMOUNTS on navigation
  // (Frame.tsx's renderPage switch renders exactly one page at a time),
  // discarding any local useState with it, so this has to live somewhere
  // that outlives the component. Keyed by an arbitrary string the page
  // itself chooses (PageShell's own scrollRestoreKey prop uses the same
  // key for scroll position) rather than one field per page, so a future
  // page can opt in without a new store field. Scroll position and
  // filter/view selections share one record per key since they're both
  // "this page's own remembered UI state," not because they're
  // conceptually the same thing.
  pageUiState: Record<string, { scrollTop?: number; [key: string]: unknown }>;
  setPageUiState: (key: string, patch: Record<string, unknown>) => void;
  setPage: (page: Page) => void;
  navigateToModule: (module: string) => void;
  clearFocusModule: () => void;
  // Click-through from Asset Discovery's grid (Phase 16): browse the
  // entity first, investigate second — this is the one action that sets
  // both page and selectedEntityId together, so no call site can set one
  // without the other. Optional `target` (Phase 20 WO-1): an Overview
  // preview card deep-linking into its own tab with a specific item
  // pre-selected — additive, every existing single-arg call site
  // (EntitiesPage, HoldingsPage, DashboardPage) stays unaffected.
  openEntityDetail: (entityId: string, target?: { tab: string; itemId?: string }) => void;
  clearEntityDetailTarget: () => void;
}

// No router dependency (CLAUDE.md §5's closed list has none) — a plain
// page enum plus an optional location.hash sync, read once at store
// init and written on every navigation (assigning location.hash to a
// new value already pushes a history entry — no manual pushState
// needed). The hash lives on the iframe's own location, never colliding
// with Storybook's own ?id=/&globals= query params.
export const usePageStore = create<PageState>((set) => ({
  page: readHashPage(),
  focusModule: null,
  selectedEntityId: null,
  entityDetailTarget: null,
  pageUiState: {},
  setPageUiState: (key, patch) =>
    set((state) => ({ pageUiState: { ...state.pageUiState, [key]: { ...state.pageUiState[key], ...patch } } })),
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
  openEntityDetail: (entityId, target) => {
    window.location.hash = "entity-detail";
    useArtifactStore.getState().closeStack();
    set({ page: "entity-detail", selectedEntityId: entityId, entityDetailTarget: target ?? null });
  },
  clearEntityDetailTarget: () => set({ entityDetailTarget: null }),
}));

// Browser back/forward support: the hash-writing above already creates a
// history entry on every navigation (a plain location.hash assignment to
// a new value is pushState-equivalent) — the one missing piece was ever
// reacting to popstate. This does exactly that and nothing else: read the
// hash the browser already restored, set page to match. No second
// hash-writer, no pushState/replaceState of its own — mirroring setPage's
// own "leaving home closes the stack" rule so a restored place page
// doesn't show a stale artifact stack. selectedEntityId is intentionally
// NOT restored here (it was never hash-encoded — see openEntityDetail's
// own comment on why deep-linking a specific entity is out of scope);
// landing back on entity-detail shows whichever entity is still in
// memory, which is the same honest limitation that already existed.
// Called once from Frame.tsx's app-lifetime effect, same pattern as
// connectLiveChannel.
export function connectPageHistory(): () => void {
  const handlePopstate = () => {
    const page = readHashPage();
    if (page !== "home") useArtifactStore.getState().closeStack();
    usePageStore.setState({ page });
  };
  window.addEventListener("popstate", handlePopstate);
  return () => window.removeEventListener("popstate", handlePopstate);
}
