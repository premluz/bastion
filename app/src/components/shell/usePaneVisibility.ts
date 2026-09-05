import { useEffect, useMemo, useRef } from 'react';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePaneFitCollapse } from './usePaneFitCollapse';

interface PaneVisibilityInput {
  naturalShowTranscript: boolean;
  naturalShowStack: boolean;
}

interface PaneVisibilityResult {
  rowRef: React.RefObject<HTMLDivElement | null>;
  showTranscript: boolean;
  showArtifact: boolean;
  collapsedPanes: string[];
}

// Phase 18: extracted from Frame.tsx (which sat exactly at the 200-line
// budget) — everything downstream of "does each pane naturally want to
// be open" belongs together: activity-touching, the collapse-fit
// observer, and the final show/collapse booleans the layout JSX reads.
export function usePaneVisibility({ naturalShowTranscript, naturalShowStack }: PaneVisibilityInput): PaneVisibilityResult {
  const rowRef = useRef<HTMLDivElement>(null);
  const collapsedPanes = useArtifactStore((state) => state.collapsedPanes);
  const touchPaneActivity = useArtifactStore((state) => state.touchPaneActivity);

  useEffect(() => {
    if (naturalShowTranscript) touchPaneActivity('transcript');
  }, [naturalShowTranscript, touchPaneActivity]);
  useEffect(() => {
    if (naturalShowStack) touchPaneActivity('artifact');
  }, [naturalShowStack, touchPaneActivity]);

  // usePaneFitCollapse RE-ENABLED (Phase 20 WO-2, 2026-08-21 — direct
  // order confirmed via AskUserQuestion: "auto-collapse least-recently-
  // active pane" for the mobile three-in-a-row overflow case). Disabled
  // 2026-08-09 because the three PER-PANE floors it was reconciling
  // against were fighting each other (420/360/320px, so one pane could
  // hit its own floor before its neighbours and visibly overlap them at
  // some intermediate width) — that root cause is gone now that
  // Frame.module.css unifies every pane onto ONE mobile floor
  // (MOBILE_PANE_FLOOR, paneFloors.ts) below the mobile breakpoint, so
  // re-enabling no longer reopens the original bug. No separate mobile-
  // only gating needed HERE: the mechanism is purely reactive to the
  // row's own measured `clientWidth` via ResizeObserver — at desktop
  // widths three panes at their (still much larger, unchanged) desktop
  // floors comfortably fit, so `isOverflowing` never trips there; it
  // only fires once real narrow-viewport pressure exists, which is
  // mobile by construction, not by an explicit width check duplicated
  // here. collapseCandidates never includes 'content' — Home's own
  // primary transcript+composer column was never a collapse candidate
  // before this change either (see git history) and stays that way:
  // "never a 4th forced column" also means never collapsing the ONE
  // column that's always there.
  const collapseCandidates = useMemo(
    () => [...(naturalShowTranscript ? ['transcript'] : []), ...(naturalShowStack ? ['artifact'] : [])],
    [naturalShowTranscript, naturalShowStack],
  );
  usePaneFitCollapse(rowRef, collapseCandidates);

  const showTranscript = naturalShowTranscript && !collapsedPanes.includes('transcript');
  const showArtifact = naturalShowStack && !collapsedPanes.includes('artifact');

  // Mobile: artifact nests OVER chat, doesn't replace it (revised
  // 2026-08-22, direct feedback: "artifacts open as another modal
  // covering fully the old (not replacing)... nested modal[s]").
  // Originally (2026-08-21: "modal windows should not stack") both panes
  // were made mutually exclusive on mobile — only the more-recently-
  // active one could be `show*` at all. Confirmed via AskUserQuestion
  // this round: that was wrong for this direction — opening an artifact
  // while chat is already open should stack the artifact Dialog ON TOP of
  // the STILL-MOUNTED chat Dialog (both real native <dialog> elements
  // stay open; the browser's own top-layer stacks whichever opened most
  // recently above the other), so closing the artifact reveals chat still
  // underneath rather than gone. isMobile is no longer read here at all —
  // showTranscript/showArtifact now simply mirror their natural desktop
  // values unconditionally; DOM order in MobilePaneModals.tsx (chat
  // Dialog before artifact Dialog) is what puts artifact on top when both
  // are open, nothing computed here needs to reconcile them.

  return {
    rowRef,
    showTranscript,
    showArtifact,
    collapsedPanes,
  };
}
