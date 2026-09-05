import { useEffect, useState } from 'react';
import { ArtifactStack } from './ArtifactStack';
import layout from './Frame.module.css';
import mobile from './ArtifactStackMount.module.css';
import './ArtifactStackMount.css';

interface ArtifactStackMountProps {
  show: boolean;
  isMobile?: boolean;
}

// Slide in/out (architect order): a plain `{show && <ArtifactStack/>}`
// conditional can only ever pop the panel away instantly — React has
// already unmounted it by the time any "exit animation" could run.
// Mirrors Canvas.tsx's own established exit/enter precedent (an isExiting
// flag + onAnimationEnd, not a guessed timeout): stays mounted through its
// own slide-out before finally unmounting. A single mount-time slide-in
// covers BOTH entry points the order named — a manual toggle-button click
// and an automatic autoOpen once a trail settles — uniformly, with no
// special-casing needed: both just flip `show` to true the same way.
// isMobile (2026-08-22): inside MobilePaneModals.tsx's fullscreen Dialog,
// this mount's own desktop concerns don't apply — the Dialog itself
// already handles open/close presentation (its own native <dialog>
// entrance, no competing slide-in), and layout.artifactPane's desktop
// pane-row sizing (flex-basis/min-width meant to share Frame.module.css's
// .row with sibling panes) has no row to share on mobile, where this is
// the Dialog's only child. Skips straight to a plain full-height wrapper.
export function ArtifactStackMount({ show, isMobile = false }: ArtifactStackMountProps) {
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

  if (isMobile) {
    return (
      <div className={mobile.mobileWrap}>
        <ArtifactStack isMobile />
      </div>
    );
  }

  return (
    <div
      className={layout.artifactPane}
      data-pane="artifact"
      style={{
        display: 'flex',
        // --merlin-pane-min-width matches .artifactPane's own resting
        // min-width (Frame.module.css) — the reflow keyframes (see
        // ArtifactStackMount.css's own comment) animate min-width down to
        // 0 on exit / up to this floor on enter, since the class's own
        // min-width would otherwise clamp the shrink before it completes.
        ['--merlin-pane-min-width' as string]: '420px',
        animationName: isExiting ? 'merlin-panel-reflow-out-grow' : 'merlin-panel-reflow-in-grow',
        animationDuration: isExiting ? 'var(--motion-exit-duration)' : 'var(--motion-enter-duration)',
        animationTimingFunction: isExiting ? 'var(--motion-exit-ease)' : 'var(--motion-enter-ease)',
        animationFillMode: 'forwards',
      }}
      onAnimationEnd={isExiting ? handleExitEnd : undefined}
    >
      <ArtifactStack />
    </div>
  );
}
