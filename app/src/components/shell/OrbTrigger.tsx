import { ContainedOrb } from './ContainedOrb';
import { MonolithOrb } from './MonolithOrb';
import styles from './OrbTrigger.module.css';

export interface OrbTriggerProps {
  onOpen: () => void;
  /** What sits in the slot: the plasma held in glass, or the Bastion monolith. */
  variant?: 'plasma' | 'monolith';
  /** The assistant is working; the monolith turns its light up. The plasma ignores it. */
  working?: boolean;
}

// The assistant in the navigation's + slot (2026-10-23, direct feedback with a mock: the
// attention home has the orb where the + was). Tapping it opens the assistant, as the
// swipe up does. The agent's status floats above it, but belongs to the dock (GlowDock).
export function OrbTrigger({ onOpen, variant = 'plasma', working = false }: OrbTriggerProps) {
  return (
    <div className={styles.root}>
      <button type="button" className={styles.orb} aria-label="Open assistant" onClick={onOpen}>
        {variant === 'monolith' ? <MonolithOrb working={working} /> : <ContainedOrb />}
      </button>
    </div>
  );
}
