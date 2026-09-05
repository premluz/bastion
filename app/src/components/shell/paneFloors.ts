// One shared floor for all three shell-level panes (direct order,
// 2026-08-09: "the panes... should be all three the same even when the
// screen [is] such a small size" — content/artifact/transcript previously
// had three DIFFERENT min-widths, 420/360/320px, which is what let one
// pane hit its own floor before its neighbours and visibly overlap them
// at intermediate row widths, since usePaneFitCollapse's auto-collapse
// (the mechanism that was reconciling mismatched floors) is now disabled
// — see usePaneVisibility.ts's own note. Set to 420, the highest of the
// three previous values, not a new/lower number: Frame.module.css's own
// prior comment on .contentColumn ("420px keeps EntityDetailPage's own
// 2-column reflow legible at the floor, the narrowest real content this
// column renders today") was a live-verified legibility floor, and
// lowering it to match the smaller panes would reopen that question
// rather than genuinely fix anything — raising the two smaller panes UP
// to the already-verified number is the non-regressive choice.
// One source of truth, read by Frame.module.css's own values (kept in
// sync by hand, CSS can't import JS constants) and by every component
// that needs the SAME number for a JS-side computation (ArtifactStack
// .tsx's resizable minSizePx — dormant, kept wired per the ResizeHandle
// order — ArtifactStackMount.tsx's wrapper min-width).
export const PANE_FLOOR = 420;

// Chat/transcript pane's own floor (2026-08-17 follow-up) — the shared
// PANE_FLOOR above no longer applies to this one pane: direct feedback
// capped the chat column at max-width 400px (no longer part of the
// content↔artifact equal split), and 420 > 400 would put the floor ABOVE
// the ceiling, a real contradiction. Confirmed via AskUserQuestion before
// picking a value: chat gets its own genuinely smaller floor rather than
// stretching the unified-floor rule to cover a pane it was never
// designed for. Frame.module.css's .transcriptPane kept in sync by hand.
export const CHAT_PANE_FLOOR = 320;

// Chat/transcript pane's own ceiling (2026-08-30 follow-up, direct
// feedback: an inline asset-card-grid result — 2 real columns at
// config.assetCardGrid's own 240px minWidth — was visibly overlapping
// inside the 400px cap; 2×240 + gap + the pane's own padding needs more
// room than 400px genuinely has). Raised from 400 to 480, the smallest
// bump that lets a 2-column card row actually fit without forcing a
// third column or fighting config.assetCardGrid's own minWidth. Frame.
// module.css's .transcriptPane and TranscriptPaneMount.tsx's own
// --merlin-pane-basis kept in sync by hand (CSS/inline styles can't
// import this constant) — same "one source of truth, several hand-synced
// consumers" pattern PANE_FLOOR above already documents.
export const CHAT_PANE_MAX = 480;

// Mobile pane floor (Phase 20 WO-2, 2026-08-21) — direct order: "we need
// mobile handling and purely responsive behavior... the three panes
// underneath... just resize, and they remain three in a row." Every
// pane (content/transcript/artifact) shares ONE smaller floor below the
// mobile breakpoint, same "all panes the same" principle PANE_FLOOR
// above already established for desktop, just at a genuinely mobile-
// appropriate number. Confirmed via AskUserQuestion before picking a
// value: a real minimum that keeps a pane's own content (composer input,
// chart, table) legible, not zero — the row's own overflow at 3 panes ×
// this floor is what usePaneFitCollapse (re-enabled the same round) now
// resolves by auto-collapsing the least-recently-active pane, not by
// shrinking further past this number. Frame.module.css's own media query
// kept in sync by hand (CSS can't import this constant).
export const MOBILE_PANE_FLOOR = 280;
