import { lazy, Suspense, useRef } from 'react';
import type { MonolithOrbMood } from './monolithOrbStates';
import styles from './MonolithOrb.module.css';
import { useMonolithAppearance } from './useMonolithAppearance';
import type { AssemblyClock } from './useAssemblyClock';

const MonolithCanvas = lazy(() => import('./MonolithCanvas'));

// The canvas is much larger than its slot, so the glow fades out inside it instead of being cut square;
// the framing keeps the cube about the size of the slot.
const FRAMING = 0.6;

export interface MonolithOrbProps {
  /** The assistant is working: the light inside turns up and moves across the body. */
  working?: boolean;
  assembly?: AssemblyClock;
  className?: string;
}

// The Bastion monolith in the navigation's + slot, as the alternative to the plasma orb (2026-10-25,
// direct request: "bottom right AI orb so we'll have our monument there", then "there wouldn't be
// anything underneath it": no disc or oval, the monolith sits straight on the page). It fills its
// parent and the parent sets the size, like ContainedOrb.
export function MonolithOrb({ working = false, className, assembly }: MonolithOrbProps) {
  const host = useRef<HTMLSpanElement>(null);
  const appearance = useMonolithAppearance(host);
  const animation = assembly === undefined ? {} : { assembly, cubeAssembly: true };
  return (
    <span ref={host} className={className ? `${styles.root} ${className}` : styles.root} aria-hidden="true">
      {appearance !== null && (
        <span className={styles.bleed}>
          <Suspense fallback={null}>
            <MonolithCanvas mood={working ? 'working' : 'rest'} appearance={appearance} framing={FRAMING} turnWithDock {...animation} />
          </Suspense>
        </span>
      )}
    </span>
  );
}
