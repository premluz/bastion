import type { StoreApi } from "zustand";
import { useSessionStore } from "./sessionStore";

// Shell-level pane kind (not an artifact-stack-internal concept) — today
// just "transcript" | "artifact", content column is never a candidate
// (it's the primary content, always protected). Kept as a bare string,
// not a union, since only Frame.tsx's own pane-fit logic reads/writes
// it — same "don't over-model" precedent as artifact.module already
// being a bare string.
export type PaneKind = string;

// Extracted from artifactStore.ts (2026-07-29, file budget) — Phase 8H's
// "one home for pane-shaped state, not two kept in sync" still holds:
// this is a Zustand slice folded into the SAME store object via
// createPaneVisibilitySlice(set, get) below, not a second store. Only
// the source file split; useArtifactStore is still the one hook every
// caller already uses for this state.
export interface PaneVisibilityState {
  // Phase 18: "which pane hasn't been touched in a while" for the
  // collapse trigger — reintroduced deliberately after Phase 8H's own
  // consolidation removed a similar mechanism (only one pane existed
  // then). Does not re-fragment "is this pane open" (still
  // pageStore/sessionStore.activeThreadId/isStackOpen) — only adds
  // "when was it last active," a genuinely new question.
  paneActivity: Record<PaneKind, number>;
  touchPaneActivity: (pane: PaneKind) => void;
  // Which pane is currently force-collapsed for width — null means
  // nothing is. At most one at a time ("never a 4th forced column").
  // "Labeled return point, one-click restore": CollapsedPaneChip.tsx
  // reads this and calls setCollapsedPane(null).
  collapsedPane: PaneKind | null;
  setCollapsedPane: (pane: PaneKind | null) => void;
  // Manual "show chat before hasStarted" override (direct order,
  // 2026-07-29) — naturalShowTranscript otherwise requires an active
  // thread, which doesn't exist yet on a cold place page. Sticky by
  // design (not auto-reset when a thread later starts or ends): once a
  // user has asked to see chat, leaving it open on navigation reads as
  // the expected behavior, not a bug to guard against.
  isChatForcedOpen: boolean;
  // Deliberately NOT expressed via collapsedPane — confirmed live that
  // reusing it fights usePaneFitCollapse's own "fits again, clear it"
  // rule (checkFit's effect re-runs on every collapsedPane change and
  // immediately un-collapses the instant there's no actual width
  // overflow, which is almost always true at a normal viewport width —
  // it can't tell "the user closed this" from "this no longer needs to
  // be squeezed," and clearing the latter is exactly its job). A
  // separate flag folded into naturalShowTranscript itself (so
  // usePaneFitCollapse's candidate list correctly excludes it too,
  // rather than fighting over the same field) is the fix, not a change
  // to that already-hard-won observer logic.
  isChatManuallyClosed: boolean;
  toggleChatPane: () => void;
}

export function createPaneVisibilitySlice(set: StoreApi<PaneVisibilityState>["setState"]): PaneVisibilityState {
  return {
    paneActivity: {},
    touchPaneActivity: (pane) => set((state) => ({ paneActivity: { ...state.paneActivity, [pane]: Date.now() } })),
    collapsedPane: null,
    setCollapsedPane: (pane) => set({ collapsedPane: pane }),
    isChatForcedOpen: false,
    isChatManuallyClosed: false,
    // Single action ChatPaneControl calls — reads sessionStore.
    // activeThreadId (same cross-store-read precedent artifactStore's own
    // setOpenArtifact uses) to know whether the pane is "naturally"
    // showing, then either marks it manually closed or reveals it
    // (clearing the manual-close flag + forcing it open for the
    // pre-hasStarted case). collapsedPane (the width-squeeze mechanism)
    // is untouched either way — see isChatManuallyClosed's own comment
    // for why reusing it caused a real bug.
    toggleChatPane: () => {
      const hasStarted = useSessionStore.getState().activeThreadId !== null;
      set((state) => {
        const isVisible = (hasStarted || state.isChatForcedOpen) && !state.isChatManuallyClosed;
        if (isVisible) {
          return { isChatManuallyClosed: true, isChatForcedOpen: false };
        }
        return { isChatManuallyClosed: false, isChatForcedOpen: true };
      });
    },
  };
}
