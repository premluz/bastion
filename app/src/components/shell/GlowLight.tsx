import { AssistantOrb } from './AssistantOrb';
import '../../theme/agent-dock.css';
import '../../theme/glow-dock.css';
import styles from './GlowLight.module.css';

// The glow home's light (2026-10-10): a soft ambient glow with the plasma orb in
// it, low on the bottom edge. One component for the open composer and voice mode,
// so both show the same light (direct feedback: the voice orb differed). How
// revealed it is comes from the inherited `--glow-reveal` (0 → 1); `isOpen` plays
// the snap.
export function GlowLight({ isOpen }: { isOpen: boolean }) {
  return (
    <div className={styles.light} data-open={isOpen ? '' : undefined} aria-hidden="true">
      <div className={styles.ambient} />
      <div className={styles.glow}><AssistantOrb variant="unbounded" /></div>
    </div>
  );
}
