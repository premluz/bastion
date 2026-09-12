import '../../theme/shell.safe-one.css';
import styles from './AssistantOrb.module.css';

export type AssistantActivity = 'idle' | 'listening' | 'thinking';

export interface AssistantOrbProps {
  activity?: AssistantActivity;
  expanded?: boolean;
}

// App-shell decoration, not a scene node: no registry schema (§2.1/§2.14).
export function AssistantOrb({ activity = 'idle', expanded = false }: AssistantOrbProps) {
  return (
    <span className={styles.root} data-activity={activity} data-expanded={expanded} aria-hidden="true">
      <span className={styles.core} />
    </span>
  );
}
