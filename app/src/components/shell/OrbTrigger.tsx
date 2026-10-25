import { ContainedOrb } from './ContainedOrb';
import styles from './OrbTrigger.module.css';

export interface OrbTriggerProps {
  onOpen: () => void;
}

// The assistant in the navigation's + slot (2026-10-23, direct feedback with a mock: the
// attention home has the orb where the + was). Tapping it opens the assistant, as the
// swipe up does. The agent's status floats above it, but belongs to the dock (GlowDock).
export function OrbTrigger({ onOpen }: OrbTriggerProps) {
  return (
    <div className={styles.root}>
      <button type="button" className={styles.orb} aria-label="Open assistant" onClick={onOpen}>
        <ContainedOrb />
      </button>
    </div>
  );
}
