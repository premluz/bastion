import { useEffect, useRef, useState } from 'react';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePaneFitCollapse } from './usePaneFitCollapse';
import { CollapsedPaneChip } from './CollapsedPaneChip';
import './ArtifactStackMount.css';

const PANE_IDS = ['pane-a', 'pane-b'] as const;

// Phase 18 gate substitute (Prem's ruling, 2026-07-26): at the time, the
// real 2-candidate collapse scenario couldn't be produced — transcript and
// artifact never coexisted under pageStore's own navigation law. That
// premise no longer holds (2026-08-28: transcript auto-shows on any
// non-Home page once a thread has started, so a Discover-page artifact
// pane + auto-shown transcript genuinely do coexist and can both need to
// collapse — see usePaneFitCollapse.ts's own comment for the live bug this
// surfaced). This harness still exercises usePaneFitCollapse directly
// against two arbitrary fake panes forced to overflow a fixed-width row —
// kept even though the live app can now produce the real case too, since
// an isolated harness verifies the mechanism without depending on the full
// shell's own state wiring.
//
// Reuses ArtifactStackMount's own slide-in/out keyframes and
// isMounted/isExiting lifecycle (not a plain toggle) — the exact class of
// bug this order fixed (transform-skewed overflow readings, animation-
// cancel oscillation on restore) only reproduces under a real animated
// mount/unmount, not a static div.
function AnimatedPane({ show, label, paneId }: { show: boolean; label: string; paneId: string }) {
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
      data-pane={paneId}
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
  const collapsedPanes = useArtifactStore((state) => state.collapsedPanes);
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
        <AnimatedPane show={!collapsedPanes.includes('pane-a')} label="Pane A" paneId="pane-a" />
        {collapsedPanes.includes('pane-a') && <CollapsedPaneChip pane="pane-a" />}
        <AnimatedPane show={!collapsedPanes.includes('pane-b')} label="Pane B" paneId="pane-b" />
        {collapsedPanes.includes('pane-b') && <CollapsedPaneChip pane="pane-b" />}
      </div>
    </div>
  );
}
