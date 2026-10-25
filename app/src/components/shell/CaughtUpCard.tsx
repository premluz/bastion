import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { CheckIcon } from '@heroicons/react/24/outline';
import '../../theme/sending.css';
import styles from './CaughtUpCard.module.css';

// The end of the attention queue (2026-10-23, direct feedback): the transfer card's own
// confirmation — its green mark springing in over the sage wash — saying the user is caught
// up. No description. `isLeaving` sinks it back into the screen's depth.
export function CaughtUpCard({ isLeaving }: { isLeaving: boolean }) {
  return (
    <div className={styles.root} data-leaving={isLeaving ? '' : undefined} role="status">
      <span className={styles.mark}><Icon icon={CheckIcon} size="lg" /></span>
      <Text type="large" className={styles.title}>You’re caught up</Text>
    </div>
  );
}
