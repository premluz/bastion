import { useState } from 'react';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Text } from '@astryxdesign/core/Text';
import type { HistoryEntry } from '../../contracts/props/history-item';
import { groupAccountHistory, HISTORY_FILTERS, HISTORY_FILTER_LABELS, isHistoryFilter, type HistoryFilter } from './accountHistory';
import { HistoryItem } from './HistoryItem';
import styles from './AccountPages.module.css';

export function AccountHistoryPage({ entries, onSelect }: { entries: readonly HistoryEntry[]; onSelect?: (entry: HistoryEntry) => void }) {
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const groups = groupAccountHistory(entries, filter);
  return (
    <div className={styles.history}>
      <div className={styles.filters}>
        <SegmentedControl label="History filter" value={filter}
          onChange={(value) => { if (isHistoryFilter(value)) setFilter(value); }}>
          {HISTORY_FILTERS.map((value) => <SegmentedControlItem key={value} value={value} label={HISTORY_FILTER_LABELS[value]} />)}
        </SegmentedControl>
      </div>
      <div className={styles.historyBody}>
        {groups.map(({ day, label, items }) => <section key={day} className={styles.historyGroup} aria-label={label}>
          <Text type="label" color="secondary">{label}</Text>
          <div className={styles.historyRows}>{items.map((entry) => <HistoryItem key={entry.id} entry={entry} {...(onSelect ? { onSelect } : {})} />)}</div>
        </section>)}
        {groups.length === 0 && <EmptyState title="No activity yet" description="Activity for this account will appear here." />}
      </div>
    </div>
  );
}
