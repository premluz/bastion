import { useEffect, useRef } from 'react';
import { useArtifactStore } from '../../engine/stores/artifactStore';

interface PaneVisibilityInput {
  naturalShowTranscript: boolean;
  naturalShowStack: boolean;
}

interface PaneVisibilityResult {
  rowRef: React.RefObject<HTMLDivElement | null>;
  showTranscript: boolean;
  showArtifact: boolean;
  collapsedPane: string | null;
}

// Phase 18: extracted from Frame.tsx (which sat exactly at the 200-line
// budget) — everything downstream of "does each pane naturally want to
// be open" belongs together: activity-touching, the collapse-fit
// observer, and the final show/collapse booleans the layout JSX reads.
export function usePaneVisibility({ naturalShowTranscript, naturalShowStack }: PaneVisibilityInput): PaneVisibilityResult {
  const rowRef = useRef<HTMLDivElement>(null);
  const collapsedPane = useArtifactStore((state) => state.collapsedPane);
  const touchPaneActivity = useArtifactStore((state) => state.touchPaneActivity);

  useEffect(() => {
    if (naturalShowTranscript) touchPaneActivity('transcript');
  }, [naturalShowTranscript, touchPaneActivity]);
  useEffect(() => {
    if (naturalShowStack) touchPaneActivity('artifact');
  }, [naturalShowStack, touchPaneActivity]);

  // usePaneFitCollapse call REMOVED (direct order, 2026-08-09: "disable
  // this mechanism and keep the code for later" — the auto-collapse and
  // the three PER-PANE floors it was reconciling against were fighting
  // each other: content/artifact/transcript had different min-widths
  // (420/360/320px), so at some intermediate row widths one pane hit its
  // floor before the others and visibly overlapped its neighbour, and
  // this observer wasn't reliably catching every such width in time.
  // usePaneFitCollapse.ts itself is untouched — this is the same "keep
  // the mechanism, stop invoking it" treatment as ArtifactStack.tsx's own
  // ResizeHandle removal earlier the same day. `rowRef` stays returned/
  // attached below regardless, since Frame.tsx's row DOM node is the ref
  // target either way — re-enabling is calling usePaneFitCollapse(rowRef,
  // collapseCandidates) again with the collapseCandidates memo restored.
  // `collapsedPane` below now always reads null (its own store default,
  // since nothing calls setCollapsedPane anymore) — showTranscript/
  // showArtifact correctly reduce to just naturalShowTranscript/
  // naturalShowStack as a result, which is the intended "no collapse
  // happens" behaviour, not a side effect to work around.

  return {
    rowRef,
    showTranscript: naturalShowTranscript && collapsedPane !== 'transcript',
    showArtifact: naturalShowStack && collapsedPane !== 'artifact',
    collapsedPane,
  };
}
