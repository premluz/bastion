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

  // Stable reference across renders (was a fresh array literal every
  // render, so usePaneFitCollapse's effect — dependent on this array —
  // tore down and rebuilt its observers on every single Frame render, not
  // just when the candidate set actually changed. Confirmed live (Phase
  // 18 gate): that churn cancelled the pane's own exit CSS animation
  // mid-flight, so `animationend` never fired and the panel + its
  // collapse chip stayed permanently mounted together.
  const collapseCandidates = useMemo(
    () => [
      ...(naturalShowTranscript ? ['transcript'] : []),
      ...(naturalShowStack ? ['artifact'] : []),
    ],
    [naturalShowTranscript, naturalShowStack],
  );
  usePaneFitCollapse(rowRef, collapseCandidates);

  return {
    rowRef,
    showTranscript: naturalShowTranscript && collapsedPane !== 'transcript',
    showArtifact: naturalShowStack && collapsedPane !== 'artifact',
    collapsedPane,
  };
}
