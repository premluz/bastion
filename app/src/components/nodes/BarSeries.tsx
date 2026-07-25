import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type BarShapeProps } from 'recharts';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { BarSeriesProps } from '../../contracts/props/bar-series';
import { TabularTick, TokenTooltip } from './chartCraft';

// Signal hue for the primary series only, same rule as time-series —
// additional series fall back to the viz palette, never a second accent.
const SERIES_COLORS = ['var(--accent-signal)', 'var(--viz-2)', 'var(--viz-3)'];

// Entity-linked bar (Portfolio wiring order, 2026-07-25) — same purity
// rule as EntityLink.tsx: a plain `data-entity-id` on the rendered shape,
// no onClick prop, no store access. A shell-level delegated listener
// higher up the tree is what actually navigates (Canvas.tsx / DashboardPage
// .tsx, both reuse entityLinkClick.ts's shared DOM lookup) — this stays a
// registry node, renderer-layer only. Hover-only stroke, same "emphasis is
// earned" rule EntityLink's own underline follows. `payload` isn't typed
// generically by recharts (it's whatever `data` shape the chart was given)
// so the `entityId` we stash on each row is read off it by hand.
function LinkableBar(props: BarShapeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const entityId = (props.payload as { entityId?: string } | undefined)?.entityId;
  return (
    <rect
      x={props.x}
      y={props.y}
      width={props.width}
      height={props.height}
      fill={props.fill}
      stroke={isHovered && entityId ? 'var(--accent-signal)' : 'none'}
      strokeWidth={isHovered && entityId ? 2 : 0}
      {...(entityId ? { 'data-entity-id': entityId, style: { cursor: 'pointer' } } : {})}
      onMouseEnter={() => entityId && setIsHovered(true)}
      onMouseLeave={() => entityId && setIsHovered(false)}
    />
  );
}

// "How is it distributed over categories/periods?" — grouped bars, up to
// 3 series. x is a category or period label (not necessarily a date).
export function BarSeries({ title, data }: BarSeriesProps) {
  if (data.series.length === 0 || data.series.every((line) => line.points.length === 0)) {
    return <EmptyState title="No series data" description="No distribution returned for this query." />;
  }

  const xValues = data.series[0]?.points.map((point) => point.x) ?? [];
  const rows = xValues.map((x, index) => {
    const row: Record<string, string | number> = { x };
    for (const line of data.series) {
      row[line.id] = line.points[index]?.y ?? 0;
    }
    const entityId = data.series[0]?.points[index]?.entityId;
    return entityId ? { ...row, entityId } : row;
  });

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      {title && <Text type="label">{title}</Text>}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={rows}>
          <CartesianGrid stroke="var(--edge)" vertical={false} />
          <XAxis dataKey="x" tick={<TabularTick textAnchor="middle" dx={0} dy={12} />} />
          <YAxis tick={<TabularTick textAnchor="end" dx={-4} dy={4} />} />
          <Tooltip content={TokenTooltip} cursor={{ fill: 'var(--surface-2)' }} />
          {data.series.map((line, index) => (
            // isAnimationActive disabled — motion here is the renderer's
            // reveal stagger, never a per-component animation (rule 15).
            <Bar
              key={line.id}
              dataKey={line.id}
              name={line.label}
              fill={SERIES_COLORS[index] ?? 'var(--viz-4)'}
              isAnimationActive={false}
              shape={LinkableBar}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
