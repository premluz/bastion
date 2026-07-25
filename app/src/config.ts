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
  dashboardLayout: {
    // Phase 12 WO-1.5, per Prem's instruction: dashboard-layout is
    // decoupled from the scene contract entirely — column count and
    // per-card spans are Merlin's own UI configuring itself, never
    // scene-JSON-authored (contrast scene-grid's own `columns` prop,
    // which IS scene-authored). `spans` is author-ordered: index N
    // governs the Nth child dashboard-layout renders, wrapping it in
    // Astryx's GridSpan; a child beyond the array's length falls back to
    // 1. A live, user-adjustable column count was scoped as a stretch
    // goal for this WO and explicitly not forced — see STATE.md for why
    // it would need a registry component to read a store (rule 6
    // violation) or new cross-layer plumbing that doesn't exist anywhere
    // else; logged as a follow-up instead.
    //
    // columns=6 (not 3) as of 2026-07-18: LCM(3,2), chosen so the existing
    // 3-way row (ring-gauge/status-grid/ring-chart, span 2 each) and the
    // "Top contributors"/"Flagged positions" row (span 3 each, true 50/50)
    // both divide evenly under one shared column count — architect feedback,
    // the latter pair rendered 2:1 under columns=3.
    columns: 6,
    spans: ["full", "full", 2, 2, 2, 3, 3],
  },
} as const;
