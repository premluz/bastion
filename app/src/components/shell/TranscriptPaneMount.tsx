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
      data-pane="transcript"
      style={{
        // --merlin-pane-basis/--merlin-pane-min-width match
        // .transcriptPane's own resting flex-basis/min-width
        // (Frame.module.css) — the reflow keyframes (see
        // ArtifactStackMount.css's own comment) animate both down to 0 on
        // exit / up to these values on enter, since the class's own
        // values would otherwise clamp the shrink before it completes.
        // 480px (paneFloors.ts's CHAT_PANE_MAX, raised from 400 the same
        // round .transcriptPane's own max-width was).
        ['--merlin-pane-basis' as string]: '480px',
        ['--merlin-pane-min-width' as string]: '320px',
        animationName: isExiting ? 'merlin-panel-reflow-out-basis' : 'merlin-panel-reflow-in-basis',
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
