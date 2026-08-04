import { useEffect, useState } from 'react';
import { TranscriptAndComposer } from './TranscriptAndComposer';
import './ArtifactStackMount.css';
import layout from './Frame.module.css';

interface TranscriptPaneMountProps {
  show: boolean;
}

// Demo Flow #1 (Browse → Detail → Investigate, architect order) — the one
// genuinely new interaction: investigating from a place page (Entity
// Detail today, any place page for free) no longer requires navigating to
// Home to watch the trail play. Slides in using the same mount/unmount
// discipline as ArtifactStackMount (reused, not duplicated), from the
// trailing edge (2026-07-30: chat pane moved to rightmost, per the
// direct order in Frame.tsx's row, so it enters from the right like
// ArtifactStackMount does). Gated on sessionStore's activeThreadId alone,
// no new store: presentScene.ts already flips it the instant submitQuery
// is called, before the trail even plays — exactly the "chat slides in,
// then the trail plays" beat this order asks for.
export function TranscriptPaneMount({ show }: TranscriptPaneMountProps) {
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
      className={layout.transcriptPane}
      style={{
        animationName: isExiting ? 'merlin-panel-slide-out' : 'merlin-panel-slide-in',
        animationDuration: isExiting ? 'var(--motion-exit-duration)' : 'var(--motion-enter-duration)',
        animationTimingFunction: isExiting ? 'var(--motion-exit-ease)' : 'var(--motion-enter-ease)',
        animationFillMode: 'forwards',
      }}
      onAnimationEnd={isExiting ? handleExitEnd : undefined}
    >
      <TranscriptAndComposer />
    </div>
  );
}
