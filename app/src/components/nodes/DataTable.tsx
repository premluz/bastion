import { Table, proportional } from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { DataTableProps } from '../../contracts/props/data-table';
import { Sparkline } from './Sparkline';
import { EntityLink } from './EntityLink';

type SparklinePoints = { x: string; y: number }[];
type EntityLinkCell = { entityId: string; label: string };
type Row = Record<string, string | number | boolean | null | SparklinePoints | EntityLinkCell>;

function isEntityLinkCell(value: unknown): value is EntityLinkCell {
  return typeof value === 'object' && value !== null && 'entityId' in value && 'label' in value;
}

// Visual register adopted from Astryx's table-page template
// (.astryx-scratch/table-page/page.tsx lines 428-435): hasHover added (a
// real missing affordance — row hover highlight). density stays
// "compact", not the template's "balanced" — node-vocabulary.md's
// data-table entry specifies "Dense rows" as ratified law, which the
// template's own density choice doesn't override. The count-label
// caption mirrors PowerSearch's own "N results" convention (confirmed
// via `astryx component PowerSearch --dense`) — PowerSearch itself is
// out of scope per this work order (no search/filter/toolbar), so the
// count is a plain Text line rather than routed through that component.
export function DataTable({ data }: DataTableProps) {
  if (data.rows.length === 0) {
    return <EmptyState title="No matching rows" description="No records returned for this query." />;
  }

  const columns = data.columns.map((column) => ({
    key: column.key,
    header: column.label,
    width: proportional(1),
    align: column.type === 'number' ? ('end' as const) : ('start' as const),
    renderCell: (row: Row) => {
      const value = row[column.key];
      if (column.type === 'sparkline') {
        return Array.isArray(value) ? <Sparkline points={value} /> : null;
      }
      if (column.type === 'entity' && isEntityLinkCell(value)) {
        return <EntityLink entityId={value.entityId} label={value.label} />;
      }
      return (
        <Text type="body" hasTabularNumbers={column.type === 'number'}>
          {value === null || value === undefined ? '—' : String(value)}
        </Text>
      );
    },
  }));

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      <Text type="supporting" color="secondary">
        {data.rows.length} result{data.rows.length === 1 ? '' : 's'}
      </Text>
      <Table<Row>
        data={data.rows}
        columns={columns}
        density="compact"
        dividers="rows"
        textOverflow="wrap"
        hasHover
      />
    </div>
  );
}
