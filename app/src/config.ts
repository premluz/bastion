// Typed config module — the pattern for all future switches (Phase 8B WO-3).
// Keep values literal and narrow (`as const`); a switch that needs richer
// shape than a boolean/string/number belongs in its own store, not here.
export const config = {
  artifacts: {
    // Panel auto-opens on trail completion when true. Card-click always
    // opens its artifact regardless of this flag — the flag only governs
    // the automatic behavior on trail completion.
    autoOpen: true,
  },
  liveChannel: {
    // mcp-server's SSE broadcast endpoint (Phase 9). Same-origin dev proxy
    // is out of scope for the prototype — the demo runs both processes on
    // localhost.
    url: "http://localhost:8787/events",
  },
  sidebar: {
    // Initial expand/collapse state (Phase 8C); the user can still toggle
    // it at runtime via SideNav's own collapse control — this is a
    // starting default, not a lock.
    expanded: true,
  },
  workbench: {
    // Default pane layout (Phase 8G). 'artifact' (WO-1) keeps its original
    // width bounds and is the only pane open by default (autoOpen honors
    // it, not config). The four WO-2 index panes (entities/sources/
    // watchlist/history) start closed — they're reference surfaces, not
    // forced-open clutter — same rail mechanism, just narrower defaults
    // since they hold simple lists, not scene content.
    panes: [
      { kind: 'artifact', open: true, width: 480, minWidth: 360, maxWidth: 720 },
      { kind: 'entities', open: false, width: 320, minWidth: 280, maxWidth: 480 },
      { kind: 'sources', open: false, width: 320, minWidth: 280, maxWidth: 480 },
      { kind: 'watchlist', open: false, width: 320, minWidth: 280, maxWidth: 480 },
      { kind: 'history', open: false, width: 320, minWidth: 280, maxWidth: 480 },
    ],
  },
} as const;
