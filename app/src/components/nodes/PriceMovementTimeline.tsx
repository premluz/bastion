import { Timestamp } from '@astryxdesign/core/Timestamp';
import { Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { PriceMovementTimelineProps } from '../../contracts/props/price-movement-timeline';
import { SourceChip } from '../trail/SourceChip';
import styles from './PriceMovementTimeline.module.css';

function formatChangePct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

// "What individually notable things has this asset's price/situation
// done, in order, each explained?" (node-vocabulary.md, Phase 20).
// Vertical-timeline visual (Phase 21 restyle, day marker + connecting
// line, per the reference) — the registry key, schema (TimelineEntry),
// and question answered are UNCHANGED; only the layout differs
// (horizontal Item list → vertical rail), so this is a restyle, not a
// new node-addition test (node-vocabulary.md's own Phase 21 section).
// Rail mechanic reused verbatim from StepRow.module.css's own git-log-
// style connecting line. Newest first, same convention as signal-feed/
// news-feed's own date-column sort. Own `glow` prop REMOVED 2026-08-19
// (direct feedback: "the bottom gradient should be applied to pane
// (card) rather than component of timeline itself") — this component's
// only real-world consumer, AssetOverviewTab.tsx, wraps it in
// PanelWithAction, which now owns the glow directly (see that file's own
// comment). A node applying its own glow only made sense when nothing
// wrapped it in a pane; every actual usage does.
export function PriceMovementTimeline({ title, entries }: PriceMovementTimelineProps) {
  if (entries.length === 0) {
    return <EmptyState title="No notable movement" description="No price-relevant events recorded for this asset." />;
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className={styles.root}>
      {title && <Text type="label">{title}</Text>}
      {sorted.map((entry, index) => (
        <div key={entry.id} className={styles.row}>
          <div className={styles.dateColumn}>
            <div className={styles.dot} />
          </div>
          {index !== sorted.length - 1 && <div className={styles.rail} />}
          <div className={styles.contentBlock}>
            <div className={styles.endContent}>
              <Timestamp value={entry.date} format="date" />
            </div>
            {entry.price !== undefined && entry.changePct !== undefined && (
              <div className={styles.priceRow}>
                <Text type="body" weight="semibold" hasTabularNumbers>
                  ${entry.price.toFixed(2)}
                </Text>
                <span className={entry.changePct >= 0 ? styles.deltaOk : styles.deltaAlert}>
                  <Icon icon={entry.changePct >= 0 ? 'arrowUp' : 'arrowDown'} size="xsm" />
                  <Text type="body" weight="semibold" hasTabularNumbers color="inherit">
                    {formatChangePct(entry.changePct)}
                  </Text>
                </span>
              </div>
            )}
            <Text type="body" weight="semibold">
              {entry.headline}
            </Text>
            {entry.detail && (
              <Text type="supporting" color="secondary">
                {entry.detail}
              </Text>
            )}
            <div className={styles.endContent}>
              <SourceChip name={entry.source.name} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
