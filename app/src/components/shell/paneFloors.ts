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
