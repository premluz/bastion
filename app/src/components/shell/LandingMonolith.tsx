import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { cssDurationMs } from './cssDuration';
import styles from './LandingMonolith.module.css';
import { useAssemblyClock } from './useAssemblyClock';
import { useCanvasWarmup } from './useCanvasWarmup';
import { useMonolithAppearance } from './useMonolithAppearance';

const MonolithCanvas = lazy(() => import('./MonolithCanvas'));

// Frames rendered hidden before the monolith is paused, enough to compile its shaders.
const WARMUP_FRAMES = 3;
// Calm and deliberate: long enough to read as the pieces finding their place, not a flourish.
const ASSEMBLY_SECONDS = 6;
// The canvas is larger than the box, so the glow fades out inside it; the framing keeps the cube the box's size.
const FRAMING = 0.6;

export interface LandingMonolithProps {
  /** The assistant's landing is open: the monolith emerges and assembles. */
  isOpen: boolean;
  /** A first question has been asked: it steps aside, as the welcome does. */
  isAway: boolean;
}

// The monolith above the landing's welcome (2026-10-25, direct request): it emerges with a fade and a
// scale-in while it assembles. Nothing sits under it. The renderer loads and warms up hidden once the home
// has settled (starting a 3D renderer takes most of a second, which on opening would freeze the page's
// recede), then stays mounted but paused whenever it is not shown (the landing closed, or the chat begun).
export function LandingMonolith({ isOpen, isAway }: LandingMonolithProps) {
  const host = useRef<HTMLDivElement>(null);
  const appearance = useMonolithAppearance(host);
  const warmup = useCanvasWarmup(WARMUP_FRAMES);
  // The same beat the CSS waits (the landing's arrival delay), read once the landing opens.
  const [arrivalDelay, setArrivalDelay] = useState(0);
  if (isOpen && arrivalDelay === 0) setArrivalDelay(cssDurationMs('--glow-landing-arrival-delay') / 1000);
  const clock = useAssemblyClock(isOpen, ASSEMBLY_SECONDS, arrivalDelay);
  const assembly = useMemo(
    () => ({ progress: clock.progress, onFrame: (deltaSeconds: number) => { clock.onFrame(deltaSeconds); warmup.onFrame(); } }),
    [clock, warmup.onFrame],
  );
  return (
    <div ref={host} className={styles.root} data-open={isOpen ? '' : undefined} data-away={isAway ? '' : undefined} aria-hidden="true">
      {(warmup.armed || isOpen) && appearance !== null && (
        <div className={styles.bleed}>
          <Suspense fallback={null}>
            <MonolithCanvas mood="landing" appearance={appearance} framing={FRAMING} paused={warmup.isWarm && (!isOpen || isAway)} assembly={assembly} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
