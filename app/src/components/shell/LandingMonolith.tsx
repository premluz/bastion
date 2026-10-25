import { lazy, Suspense, useRef, useState } from 'react';
import styles from './LandingMonolith.module.css';
import { useAssemblyClock } from './useAssemblyClock';
import { useMonolithAppearance } from './useMonolithAppearance';

const MonolithCanvas = lazy(() => import('./MonolithCanvas'));

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
// scale-in while it assembles. Nothing sits under it. The renderer loads on the first opening, then
// stays mounted but paused whenever it is not shown (the landing closed, or the chat begun).
export function LandingMonolith({ isOpen, isAway }: LandingMonolithProps) {
  const host = useRef<HTMLDivElement>(null);
  const appearance = useMonolithAppearance(host);
  const [everOpened, setEverOpened] = useState(isOpen);
  if (isOpen && !everOpened) setEverOpened(true);
  const assembly = useAssemblyClock(isOpen, ASSEMBLY_SECONDS);
  return (
    <div ref={host} className={styles.root} data-open={isOpen ? '' : undefined} data-away={isAway ? '' : undefined} aria-hidden="true">
      {everOpened && appearance !== null && (
        <div className={styles.bleed}>
          <Suspense fallback={null}>
            <MonolithCanvas mood="landing" appearance={appearance} framing={FRAMING} paused={!isOpen || isAway} assembly={assembly} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
