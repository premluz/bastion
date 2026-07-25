import { Item } from '@astryxdesign/core/Item';
import { Timestamp } from '@astryxdesign/core/Timestamp';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { SignalFeedProps } from '../../contracts/props/signal-feed';
import { EntityLink } from './EntityLink';

type EntityLinkCell = { entityId: string; label: string };

// Widened to match TableCellSchema's Phase 8E sparkline variant (unused
// here, type-compatibility only) and Phase 8F's entity-link variant
// (used below — the headline column, e.g. "entity", is where a signal's
// subject becomes a real link, per node-vocabulary.md's routing rule).
type Row = Record<string, string | number | boolean | null | { x: string; y: number }[] | EntityLinkCell>;

function isEntityLinkCell(value: unknown): value is EntityLinkCell {
  return typeof value === 'object' && value !== null && 'entityId' in value && 'label' in value;
}

// Chronological event stream, newest first (node-vocabulary.md). Reuses
// the generic table DataSet: the first "date"-typed column (if any) is the
// timestamp, the next column is the headline, remaining columns fold into
// the description — no assumed source/status columns, since TableDataSet
// carries no per-column semantic role beyond its declared type.
export function SignalFeed({ title, data }: SignalFeedProps) {
  if (data.rows.length === 0) {
    return <EmptyState title="No signals" description="No events returned for this query." />;
  }

  const dateColumn = data.columns.find((column) => column.type === 'date');
  const otherColumns = data.columns.filter((column) => column.key !== dateColumn?.key);
  const [headlineColumn, ...detailColumns] = otherColumns;

  const rows: Row[] = dateColumn
    ? [...data.rows].sort((a, b) => String(b[dateColumn.key] ?? '').localeCompare(String(a[dateColumn.key] ?? '')))
    : data.rows;

  return (
    // minWidth:0 overrides CSS Grid's own min-width:auto default — without
    // it, a long description refuses to wrap/truncate and instead forces
    // this whole grid track (and the Panel/dashboard-layout cell it sits
    // in) wider than its allotted space, expanding the pane rather than
    // adapting to it (reported live, screenshotted).
    <div style={{ display: 'grid', gap: 'var(--space-4)', minWidth: 0 }}>
      {title && <Text type="label">{title}</Text>}
      {rows.map((row, index) => {
        const headlineValue = headlineColumn ? row[headlineColumn.key] : undefined;
        const label =
          headlineColumn?.type === 'entity' && isEntityLinkCell(headlineValue) ? (
            <EntityLink entityId={headlineValue.entityId} label={headlineValue.label} />
          ) : headlineValue == null ? (
            '—'
          ) : (
            String(headlineValue)
          );
        return (
          <Item
            key={`${index}-${headlineColumn ? String(row[headlineColumn.key] ?? '') : ''}`}
            density="compact"
            label={label}
            description={detailColumns.map((column) => String(row[column.key] ?? '—')).join(' · ')}
            descriptionLines={2}
            endContent={
              dateColumn && row[dateColumn.key] != null ? (
                <Timestamp value={String(row[dateColumn.key])} format="date" />
              ) : undefined
            }
          />
        );
      })}
    </div>
  );
}
