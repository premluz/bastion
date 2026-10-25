import { AssistantOrb } from './AssistantOrb';
import '../../theme/agent-dock.css';
import '../../theme/glow-dock.css';
import styles from './ContainedOrb.module.css';

// The plasma held in a glass circle (2026-10-23, direct feedback with a reference): glass lit
// from below rather than a solid disc. It fills its parent; the parent sets the size, and
// `--contained-orb-blur` how soft the light inside is (smaller circles want less).
export function ContainedOrb({ className }: { className?: string }) {
  return (
    <span className={className ? `${styles.root} ${className}` : styles.root} aria-hidden="true">
      <span className={styles.plasma}><AssistantOrb variant="unbounded" /></span>
    </span>
  );
}
