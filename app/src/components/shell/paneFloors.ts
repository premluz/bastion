// Phase 18: shared floor widths for the three shell-level panes — one
// source of truth, read by Frame.module.css's own values (kept in sync
// by hand, CSS can't import JS constants) and by every component that
// needs the SAME number for a JS-side computation (ArtifactStack.tsx's
// resizable minSizePx, ArtifactStackMount.tsx's wrapper min-width,
// usePaneFitCollapse.ts's overflow check). Content column has no
// candidate-collapse floor here — it's never a collapse candidate, its
// own CSS min-width lives directly in Frame.module.css since nothing
// else needs that number in JS.
export const TRANSCRIPT_PANE_FLOOR = 320;
export const ARTIFACT_PANE_FLOOR = 360;
