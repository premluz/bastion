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
    <div style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
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
