import { Text } from '@astryxdesign/core/Text';
import styles from './EarningBadge.module.css';

// "Earning N%" as plain accent text, no pill (2026-10-12, direct feedback: without
// badge, on both the hero tile and the wallet). Shared so both read the same.
export function EarningBadge({ rate }: { rate: number }) {
  return <Text type="supporting" hasTabularNumbers className={styles.earning}>Earning {rate}%</Text>;
}
