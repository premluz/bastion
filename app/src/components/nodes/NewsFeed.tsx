import { Item } from '@astryxdesign/core/Item';
import { Timestamp } from '@astryxdesign/core/Timestamp';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { NewsFeedProps } from '../../contracts/props/news-feed';
import { SourceChip } from '../trail/SourceChip';

type Row = Record<string, string | number | boolean | null>;

// "What's being said about this?" (node-vocabulary.md) — the SeekingAlpha
// register, not signal-feed's operational event log. Reuses the table
// DataSet exactly like signal-feed does (same binding-mapping ruling),
// same date-column-then-positional convention for finding the rest —
// headline first, dek second, source third — but the headline itself
// carries real visual weight here (an explicit bold Text node as Item's
// `label`, not signal-feed's own quieter default), since a headline is
// the whole point of this node, not a supporting detail.
export function NewsFeed({ title, data }: NewsFeedProps) {
  if (data.rows.length === 0) {
    return <EmptyState title="No headlines" description="No coverage returned for this entity." />;
  }

  const dateColumn = data.columns.find((column) => column.type === 'date');
  const otherColumns = data.columns.filter((column) => column.key !== dateColumn?.key);
  const [headlineColumn, dekColumn, sourceColumn] = otherColumns;

  const rows: Row[] = (dateColumn ? [...data.rows].sort((a, b) => String(b[dateColumn.key] ?? '').localeCompare(String(a[dateColumn.key] ?? ''))) : data.rows) as Row[];

  return (
    // gridTemplateColumns explicit (2026-07-27): a single implicit grid
    // track sizes to its widest child's intrinsic min-content by default —
    // `minWidth: 0` on this container alone doesn't override that, same
    // "doesn't shrink" class of issue Phase 18 hit in flex contexts.
    // `minmax(0, 1fr)` makes the track respect the container's own width
    // instead of each Item's own natural (wider) content size. Confirmed
    // live: without this, an Item's row could render wider than its grid
    // cell and bleed past the panel edge at narrow widths.
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--space-4)' }}>
      {title && <Text type="label">{title}</Text>}
      {rows.map((row, index) => {
        const headline = headlineColumn ? row[headlineColumn.key] : undefined;
        const dek = dekColumn ? row[dekColumn.key] : undefined;
        const source = sourceColumn ? row[sourceColumn.key] : undefined;
        return (
          <Item
            key={`${index}-${headlineColumn ? String(headline ?? '') : ''}`}
            density="compact"
            label={
              <Text type="body" weight="semibold">
                {headline == null ? '—' : String(headline)}
              </Text>
            }
            description={dek == null ? undefined : String(dek)}
            descriptionLines={1}
            endContent={
              // Column, not row (2026-07-27): Item's endContent slot doesn't
              // shrink or wrap on its own — a side-by-side source chip +
              // date pinned to the row's end became a hard floor wide
              // enough to overflow past the panel edge at narrow widths
              // (confirmed live). Stacking halves that floor to whichever
              // of the two is wider, instead of their sum.
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-4)' }}>
                {source != null && <SourceChip name={String(source)} />}
                {dateColumn && row[dateColumn.key] != null && <Timestamp value={String(row[dateColumn.key])} format="date" />}
              </div>
            }
          />
        );
      })}
    </div>
  );
}
