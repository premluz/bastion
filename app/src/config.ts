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
  artifactStack: {
    // Default width bounds for the one right-side pane (Phase 8H —
    // supersedes Phase 8G's multi-pane workbench.panes list; Artifacts is
    // the only pane now, so a single width triple replaces what used to
    // be an array). Values unchanged from the original ArtifactPanel
    // defaults (Phase 8B WO-2) — this phase changes what surrounds the
    // pane, not its own sizing.
    defaultWidth: 480,
    minWidth: 360,
    maxWidth: 720,
  },
  recent: {
    // How many turns Sidebar's Recent list shows before "View all" is the
    // only way to see more (Phase 8H) — a nav aid, not the investigation
    // record itself (that's the Investigations page, unbounded).
    count: 5,
  },
} as const;
