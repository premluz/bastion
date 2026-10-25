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
  assetCardGrid: {
    // Entity card grid (Discover's own grid view + the inline asset-card-grid
    // registry node, Phase 21 follow-up, 2026-08-30: "panes should be
    // responsive and fluid... on mobile or small space stack") — a
    // RESPONSIVE column count, not dashboard-layout's own fixed default:
    // both consumers previously hardcoded columns={4}, which stayed 4-per-
    // row even in a narrow transcript pane or on mobile, cramming the card's
    // identity/chart/price content instead of reflowing. minWidth is the
    // narrowest a card can get before its own content (logo+name, chart,
    // price+delta) starts crowding — measured against the card's real
    // rendered content, not guessed; `repeat: 'fit'` (not the default
    // 'fill') is what lets tracks actually COLLAPSE to fewer columns
    // instead of just shrinking every card equally, so a narrow-enough
    // container genuinely stacks to a single column.
    minWidth: 240,
    max: 4,
    repeat: "fit",
  },
  landing: {
    // Whether the one orb rises to the middle of the assistant's landing screen (2026-10-14).
    // Off (2026-10-21, direct feedback: switch the orb's movement off for now): it stays at the
    // bottom as the resting glow while the page leaves and the welcome and suggestions arrive.
    orbRises: false,
  },
  agent: {
    // After a scenario finishes (send, top-up…) the agent used to go straight on to
    // the next recommended action by itself (2026-10-09). Off (2026-10-14, direct
    // feedback): a finished scenario ends there; the home's suggestions are the way
    // to the next one. Flip to true to bring the handover back.
    autoHandover: false,
  },
  attention: {
    // How long the assistant works on a delegated item before it is done and leaves its
    // queue (the attention home, 2026-10-23).
    taskCompletesAfterMs: 4000,
    // How long "You're caught up" stays before it sinks away and the section closes.
    caughtUpHoldMs: 1000,
  },
} as const;
