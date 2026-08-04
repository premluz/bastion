import { useEffect, useRef, useState } from 'react';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePaneFitCollapse } from './usePaneFitCollapse';
import { CollapsedPaneChip } from './CollapsedPaneChip';
import './ArtifactStackMount.css';

const PANE_IDS = ['pane-a', 'pane-b'] as const;

// Phase 18 gate substitute (Prem's ruling, 2026-07-26): the real 4th-pane
// collapse scenario can't be produced today — the transcript and artifact
// panes never coexist under pageStore's own navigation law (see
// STATE.md). This harness exercises usePaneFitCollapse directly against
// two arbitrary fake panes forced to overflow a fixed-width row, so the
// mechanism itself is verified correct even though nothing in the live
// app calls it into a real 2-candidate choice yet.
//
// Reuses ArtifactStackMount's own slide-in/out keyframes and
// isMounted/isExiting lifecycle (not a plain toggle) — the exact class of
// bug this order fixed (transform-skewed overflow readings, animation-
// cancel oscillation on restore) only reproduces under a real animated
// mount/unmount, not a static div.
function AnimatedPane({ show, label }: { show: boolean; label: string }) {
  const [isMounted, setIsMounted] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setIsMounted(true);
      setIsExiting(false);
    } else if (isMounted) {
      setIsExiting(true);
    }
  }, [show, isMounted]);

  const handleExitEnd = () => {
    setIsMounted(false);
    setIsExiting(false);
  };

  if (!isMounted) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 200,
        height: 80,
        flexShrink: 0,
        background: 'var(--surface-2)',
        border: '1px solid var(--edge)',
        animationName: isExiting ? 'merlin-panel-slide-out' : 'merlin-panel-slide-in',
        animationDuration: 'var(--motion-enter-duration)',
        animationTimingFunction: 'var(--motion-enter-ease)',
        animationFillMode: 'forwards',
      }}
      onAnimationEnd={isExiting ? handleExitEnd : undefined}
    >
      {label}
    </div>
  );
}

export function PaneFitCollapseHarness() {
  const rowRef = useRef<HTMLDivElement>(null);
  const collapsedPane = useArtifactStore((state) => state.collapsedPane);
  const touchPaneActivity = useArtifactStore((state) => state.touchPaneActivity);

  // Pane A touched first, then B — A is the less-recently-active pane, so
  // usePaneFitCollapse should pick it to collapse first (deterministic,
  // not relying on the tie-break order alone).
  useEffect(() => {
    touchPaneActivity('pane-a');
    touchPaneActivity('pane-b');
  }, [touchPaneActivity]);

  usePaneFitCollapse(rowRef, PANE_IDS);

  return (
    // Fixed at 300px — deliberately narrower than both fake panes'
    // combined 200+200+16 gap (416px), so overflow (and therefore a
    // collapse) is forced regardless of viewport or story canvas width.
    <div style={{ width: 300, border: '1px dashed var(--edge)', padding: 'var(--space-8)' }}>
      <div ref={rowRef} style={{ display: 'flex', gap: 'var(--space-16)' }}>
        {/* Siblings, not a ternary swap — matches Frame.tsx's real
            pattern exactly. AnimatedPane owns its OWN exit-then-unmount
            lifecycle (stays mounted, mid-animation, for a beat after
            `show` goes false); CollapsedPaneChip appears immediately
            alongside it. Confirmed live: a ternary that synchronously
            replaces the pane with its chip skips that grace window —
            checkFit, triggered by the chip's own mount, then measures a
            row that already "fits" (the old pane never got its beat to
            visually still be there), which is the exact tautological
            trap additions-only was built to avoid, just reached by a
            different addition. React's "Maximum update depth exceeded"
            caught this immediately. */}
        <AnimatedPane show={collapsedPane !== 'pane-a'} label="Pane A" />
        {collapsedPane === 'pane-a' && <CollapsedPaneChip pane="pane-a" />}
        <AnimatedPane show={collapsedPane !== 'pane-b'} label="Pane B" />
        {collapsedPane === 'pane-b' && <CollapsedPaneChip pane="pane-b" />}
      </div>
    </div>
  );
}
