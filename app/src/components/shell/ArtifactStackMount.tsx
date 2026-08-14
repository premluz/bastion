import { useEffect, useState } from 'react';
import { ArtifactStack } from './ArtifactStack';
import layout from './Frame.module.css';
import './ArtifactStackMount.css';

interface ArtifactStackMountProps {
  show: boolean;
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
export function ArtifactStackMount({ show }: ArtifactStackMountProps) {
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
      className={layout.artifactPane}
      style={{
        display: 'flex',
        animationName: isExiting ? 'merlin-panel-slide-out' : 'merlin-panel-slide-in',
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
