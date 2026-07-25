import { arc, pie } from 'd3-shape';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { RingChartProps } from '../../contracts/props/ring-chart';

const VIEW_SIZE = 100;
const CENTER = VIEW_SIZE / 2;
const OUTER_RADIUS = 42;
const INNER_RADIUS = 26;

const SEGMENT_COLORS = ['var(--accent-signal)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)', 'var(--viz-5)', 'var(--viz-6)'];

interface Row {
  label: string;
  value: number;
}

const arcGenerator = arc();

// "How does this total break down across a handful of categories, at a
// glance, in a compact card?" (node-vocabulary.md, Phase 12) — extends
// ring-gauge's own d3-shape arc() usage to N segments via d3-shape's
// pie() generator (same approved dependency, still zero new
// architecture). Allocation-style, not gauge-style: a whole divided
// into parts, no single "fullness" reading.
export function RingChart({ title, data, labelColumn, valueColumn, valueSuffix }: RingChartProps) {
  const rows: Row[] = data.rows
    .map((row) => {
      const rawLabel = row[labelColumn];
      const rawValue = row[valueColumn];
      const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
      return { label: rawLabel != null ? String(rawLabel) : '', value };
    })
    .filter((row) => row.label.length > 0 && Number.isFinite(row.value) && row.value > 0);

  if (rows.length === 0) {
    return <EmptyState title="No allocation to show" description="No positive values found for this breakdown." />;
  }

  const pieGenerator = pie<Row>()
    .value((row) => row.value)
    .sort(null);
  const arcs = pieGenerator(rows);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      {title && <Text type="label">{title}</Text>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
        <svg
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          width="100%"
          style={{ maxWidth: '120px', aspectRatio: '1 / 1', display: 'block', flexShrink: 0 }}
          role="img"
          aria-label={title ?? 'Allocation breakdown'}
        >
          <g transform={`translate(${CENTER}, ${CENTER})`}>
            {arcs.map((segment, index) => {
              const path = arcGenerator({
                innerRadius: INNER_RADIUS,
                outerRadius: OUTER_RADIUS,
                startAngle: segment.startAngle,
                endAngle: segment.endAngle,
              });
              // --edge stroke between segments (architect-ordered,
              // merlin-theme-token skill promotion): --accent-signal can
              // render near-white in a theme's own native palette (found
              // live in `default`) — a thin boundary keeps segments
              // legible even when a fill washes out against its
              // neighbor or the card surface, independent of which
              // theme or which segment happens to carry which color.
              return (
                <path
                  key={rows[index]?.label}
                  d={path ?? ''}
                  fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                  stroke="var(--edge)"
                  strokeWidth={0.6}
                >
                  <title>{`${rows[index]?.label}: ${rows[index]?.value}${valueSuffix ?? ''}`}</title>
                </path>
              );
            })}
          </g>
        </svg>
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {rows.map((row, index) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <svg width="10" height="10" style={{ flexShrink: 0 }} aria-hidden="true">
                <circle cx="5" cy="5" r="5" fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} />
              </svg>
              <Text type="supporting" hasTabularNumbers display="block">
                {row.label} · {row.value}
                {valueSuffix ?? ''}
              </Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
