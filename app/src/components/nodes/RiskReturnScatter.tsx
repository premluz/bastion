import { Cell, LabelList, ResponsiveContainer, Scatter, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip, type TooltipContentProps } from 'recharts';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { RiskReturnScatterProps } from '../../contracts/props/risk-return-scatter';
import { TabularTick } from './chartCraft';
import styles from './RiskReturnScatter.module.css';

// "How does this entity compare to its peers on two numeric axes at
// once?" (2026-09-01, direct order, reference: "7D Return ↑ / Volume →",
// one labeled point per entity) — recharts' own ScatterChart, no new
// dependency. subjectEntityId (optional — props.data doesn't carry a
// "this one is the subject" flag of its own) singles out one point in
// --accent-signal; every other point renders in the shared --viz-2 peer
// hue, same "the subject reads as itself, peers read as a set" register
// TrendChart's own primary-series convention already establishes.
interface ScatterPoint { label: string; x: number; y: number }

// recharts hands the tooltip a readonly payload whose inner `payload` is
// untyped, so the point is narrowed at runtime rather than asserted.
function isScatterPoint(value: unknown): value is ScatterPoint {
  return typeof value === 'object' && value !== null && 'label' in value && typeof value.label === 'string'
    && 'x' in value && typeof value.x === 'number' && 'y' in value && typeof value.y === 'number';
}

function ScatterTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.[0]?.payload;
  if (!active || !isScatterPoint(point)) return null;
  return (
    <div className={styles.tooltip}>
      <Text type="supporting" weight="semibold">
        {point.label}
      </Text>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {point.x} / {point.y}
      </Text>
    </div>
  );
}

export function RiskReturnScatter({ title, xAxisLabel, yAxisLabel, data, subjectEntityId }: RiskReturnScatterProps) {
  if (data.points.length === 0) {
    return <EmptyState title="No comparison data" description="No entities returned for this comparison." />;
  }

  return (
    <div className={styles.root}>
      {title && <Text type="label">{title}</Text>}
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="var(--edge)" />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxisLabel}
            label={{ value: xAxisLabel, position: 'insideBottom', offset: -4, fill: 'var(--ink-muted)', fontSize: 11 }}
            tick={<TabularTick textAnchor="middle" dx={0} dy={12} />}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxisLabel}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'var(--ink-muted)', fontSize: 11 }}
            tick={<TabularTick textAnchor="end" dx={-4} dy={4} />}
          />
          <Tooltip content={ScatterTooltip} cursor={{ stroke: 'var(--edge)' }} />
          <Scatter data={data.points} isAnimationActive={false}>
            <LabelList
              dataKey="label"
              position="top"
              content={({ x, y, value }) => (
                <text x={Number(x)} y={Number(y) - 10} textAnchor="middle" fill="var(--ink-secondary)" fontSize={11} fontFamily="var(--face-data)">
                  {String(value)}
                </text>
              )}
            />
            {data.points.map((point) => (
              <Cell key={point.label} fill={point.entityId === subjectEntityId ? 'var(--accent-signal)' : 'var(--viz-2)'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
