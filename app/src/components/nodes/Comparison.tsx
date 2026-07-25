import { Table, proportional } from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { ComparisonProps } from '../../contracts/props/comparison';

// Widened to match TableCellSchema's Phase 8E sparkline and Phase 8F
// entity-link variants — comparison itself never authors either, this is
// a type-compatibility match with the shared DataSet shape, not a new
// capability here.
type Row = Record<string, string | number | boolean | null | { x: string; y: number }[] | { entityId: string; label: string }>;

// "Differences carry the emphasis, similarities stay quiet" (node-vocabulary.md,
// principle 8: emphasis is earned). An entity cell is emphasized only when
// the row's entity values aren't all identical — never emphasis by default.
export function Comparison({ title, data }: ComparisonProps) {
  if (data.rows.length === 0) {
    return <EmptyState title="No comparison" description="No candidates to compare for this query." />;
  }

  const entityColumns = data.columns.slice(1);

  const columns = data.columns.map((column, index) => ({
    key: column.key,
    header: column.label,
    width: proportional(1),
    align: 'start' as const,
    renderCell: (row: Row) => {
      const value = row[column.key];
      const display = value === null || value === undefined ? '—' : String(value);
      const rowDiffers = index > 0 && new Set(entityColumns.map((c) => String(row[c.key] ?? ''))).size > 1;
      return rowDiffers ? (
        <Text type="body" weight="semibold" color="primary">
          {display}
        </Text>
      ) : (
        <Text type="body" color="secondary">
          {display}
        </Text>
      );
    },
  }));

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      {title && <Text type="label">{title}</Text>}
      <Table<Row> data={data.rows} columns={columns} density="compact" dividers="grid" textOverflow="wrap" hasHover />
    </div>
  );
}
