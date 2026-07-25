import { useId } from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { TimeSeriesProps } from '../../contracts/props/time-series';
import { TabularTick, TokenTooltip } from './chartCraft';
import { Metric } from './Metric';

// Signal hue for the primary series only (node-vocabulary.md) — additional
// lines fall back to the viz palette, never a second accent.
const SERIES_COLORS = ['var(--accent-signal)', 'var(--viz-2)', 'var(--viz-3)'];
// Phase 12 WO-2: secondary/tertiary series gain a distinct dash pattern on
// top of their distinct color — legible even without color (screenshots,
// colorblind-safe), not just a duplicate visual channel. Primary series
// stays undefined (solid), matching its existing Area rendering.
const SERIES_DASH: (string | undefined)[] = [undefined, '6 4', '2 3'];

// The primary series renders as a token-gradient area (fill fading to
// transparent) rather than a bare line — combo mode additionally renders
// every series as bars, with the primary series still overlaid as a line
// on top ("volume bars under line"). referenceLines are horizontal
// thresholds; annotations are vertical event markers (e.g. a failure
// date), rendered in --accent-alert since they mark something that went
// wrong, not a neutral threshold.
export function TimeSeries({ title, data, variant, referenceLines, annotations, statStrip, rightAxisSeriesId }: TimeSeriesProps) {
  const gradientId = useId();

  if (data.series.length === 0 || data.series.every((line) => line.points.length === 0)) {
    return <EmptyState title="No series data" description="No time-series points returned for this query." />;
  }

  const xValues = data.series[0]?.points.map((point) => point.x) ?? [];
  const rows = xValues.map((x, index) => {
    const row: Record<string, string | number> = { x };
    for (const line of data.series) {
      row[line.id] = line.points[index]?.y ?? 0;
    }
    return row;
  });

  const primary = data.series[0];
  const isCombo = variant === 'combo';

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      {title && <Text type="label">{title}</Text>}
      {statStrip && statStrip.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
          {statStrip.map((entry) => (
            <Metric key={entry.label} label={entry.label} value={entry.value} detail={entry.detail} />
          ))}
        </div>
      )}
      {/* recharts animates line-draw on mount by default — disabled below
          (isAnimationActive) since motion here is the renderer's reveal
          stagger, never a per-component animation (CLAUDE.md rule 15). */}
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={rows}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-signal)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent-signal)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--edge)" vertical={false} />
          <XAxis dataKey="x" tick={<TabularTick textAnchor="middle" dx={0} dy={12} />} />
          <YAxis yAxisId="left" tick={<TabularTick textAnchor="end" dx={-4} dy={4} />} />
          {rightAxisSeriesId && <YAxis yAxisId="right" orientation="right" tick={<TabularTick textAnchor="end" dx={16} dy={4} />} />}
          <Tooltip content={TokenTooltip} cursor={{ stroke: 'var(--edge)' }} />

          {/* Two fixes, both found live while adding the Portfolio
              dashboard's own risk-limit line: (1) yAxisId="left" — once
              the chart carries a named axis (Phase 16's dual-axis
              addition put an explicit id on YAxis/Area/Bar/Line but
              missed these two), recharts can't resolve which axis a
              ReferenceLine without one belongs to and silently drops it.
              (2) ifOverflow="extendDomain" — the default numeric domain
              is sized to the plotted series' own data (e.g. exposure
              topping out at 23), so a threshold ABOVE that range (the
              €25M limit) still wouldn't render without telling recharts
              to widen the axis to fit it. */}
          {referenceLines?.map((ref) =>
            ref.label ? (
              <ReferenceLine
                key={ref.value}
                yAxisId="left"
                y={ref.value}
                ifOverflow="extendDomain"
                stroke="var(--ink-muted)"
                strokeDasharray="3 3"
                label={{ value: ref.label, position: 'insideTopRight', fill: 'var(--ink-muted)', fontSize: 10 }}
              />
            ) : (
              <ReferenceLine
                key={ref.value}
                yAxisId="left"
                y={ref.value}
                ifOverflow="extendDomain"
                stroke="var(--ink-muted)"
                strokeDasharray="3 3"
              />
            ),
          )}
          {annotations?.map((annotation) => (
            <ReferenceLine
              key={annotation.x}
              yAxisId="left"
              x={annotation.x}
              stroke="var(--accent-alert)"
              strokeDasharray="2 2"
              label={{ value: annotation.label, position: 'top', fill: 'var(--accent-alert)', fontSize: 10 }}
            />
          ))}

          {isCombo &&
            data.series.map((line, index) => (
              <Bar
                key={line.id}
                yAxisId={line.id === rightAxisSeriesId ? 'right' : 'left'}
                dataKey={line.id}
                name={line.label}
                fill={SERIES_COLORS[index] ?? 'var(--viz-4)'}
                fillOpacity={0.35}
                isAnimationActive={false}
              />
            ))}

          {primary && (
            <Area
              yAxisId={primary.id === rightAxisSeriesId ? 'right' : 'left'}
              type="monotone"
              dataKey={primary.id}
              name={primary.label}
              stroke="var(--accent-signal)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          )}
          {data.series.slice(1).map((line, index) => {
            const dash = SERIES_DASH[index + 1];
            return (
              <Line
                key={line.id}
                yAxisId={line.id === rightAxisSeriesId ? 'right' : 'left'}
                type="monotone"
                dataKey={line.id}
                name={line.label}
                stroke={SERIES_COLORS[index + 1] ?? 'var(--viz-4)'}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
                {...(dash ? { strokeDasharray: dash } : {})}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
