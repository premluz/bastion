import { Text } from '@astryxdesign/core/Text';
import type { HistoryEntry } from '../../contracts/props/history-item';
import { groupAccountHistory } from './accountHistory';
import { HistoryItem } from './HistoryItem';
import styles from './ActivityGroups.module.css';

// Transaction activity as one connected pane per day (2026-10-07): the single
// list MoneyPage and CardDetailPage share, so row hover, corner rounding and
// spacing can never drift between them.
export function ActivityGroups({ entries }: { entries: readonly HistoryEntry[] }) {
  const groups = groupAccountHistory(entries, 'all');
  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <div key={group.day} className={styles.group}>
          <Text type="supporting" color="secondary">{group.label}</Text>
          <div className={styles.pane}>
            {group.items.map((entry, index) => (
              <div key={entry.id} className={styles.row} data-first={index === 0 ? '' : undefined}
                data-last={index === group.items.length - 1 ? '' : undefined}>
                <HistoryItem entry={entry} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
