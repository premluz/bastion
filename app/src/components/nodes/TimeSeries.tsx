import { useId, useMemo } from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { TimeSeriesProps } from '../../contracts/props/time-series';
import { ChartBleedAxes, ChartReferenceLines, TokenTooltip } from './chartCraft';
import { getChartRevealAnimation } from './chartReveal';
import { Metric } from './Metric';
import glowStyles from '../../theme/glow.module.css';

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
// xTicks/xTickFormatter (2026-08-22): plain TS-only additions, NOT part
// of TimeSeriesPropsSchema — a function prop can't be JSON/Zod-validated,
// and time-series is a registry node whose props DO flow through that
// schema when driven by scene JSON. TrendChart is the one call site that
// invokes this component directly as React (a literal-prop node, not
// scene-bound), so it can pass real functions here safely; the registry
// path never supplies these props and is unaffected. xTicks pins the
// EXACT set of category values recharts renders as ticks (bypassing its
// own tick-selection entirely); xTickFormatter maps each of those exact
// values to its own short display label — see TrendChart.tsx's own
// buildExplicitTicks comment for why both are needed together, and why
// three formatter-only approaches were each tried and caught as real
// bugs first.
export function TimeSeries({
  title,
  data,
  variant,
  referenceLines,
  annotations,
  statStrip,
  rightAxisSeriesId,
  bleed,
  bleedHeight,
  glow,
  yAutoScale,
  xTicks,
  xTickFormatter,
  airy,
}: TimeSeriesProps & { xTicks?: string[]; xTickFormatter?: (value: string, index: number) => string; airy?: boolean }) {
  const gradientId = useId();
  // Read once per mount, not per-render — the theme value doesn't change
  // mid-render, and this is a real (if cheap) DOM style read. See
  // chartReveal.ts's own comment for why easing must be read this way at
  // all instead of a plain var(...) reference.
  const reveal = useMemo(() => getChartRevealAnimation(), []);

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

  // glow (2026-08-17): additive, default off — every existing scene usage
  // of this node renders unchanged (no glowWrapper class applied, chart
  // renders exactly as before). No inherent trend direction here (a
  // generic bind node, unlike TrendChart), so this always uses the
  // primitive's own --accent-signal default, never --delta-up/-down.
  const chart = (
    <>
      {title && <Text type="label">{title}</Text>}
      {statStrip && statStrip.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-16)', flexWrap: 'wrap' }}>
          {statStrip.map((entry) => (
            <Metric key={entry.label} label={entry.label} value={entry.value} detail={entry.detail} />
          ))}
        </div>
      )}
      {/* recharts animates line-draw on mount by default — disabled below
          (isAnimationActive) on every series EXCEPT the primary Area when
          bleed is set (2026-08-31 direct feedback: "let's test first on
          entity detail page main chart" — a left-to-right reveal, staged
          here before any wider rollout to sparklines/chat cards). Scoped
          to bleed specifically since that's the one real Entity Detail
          consumer today (TrendChart.tsx) — every non-bleed time-series
          usage (scene-driven fixtures, dashboards, combo bars, secondary
          Lines) keeps isAnimationActive off, unchanged: motion there is
          still the renderer's own reveal stagger, never a per-component
          hack (CLAUDE.md rule 15) — this reveal is a NAMED, SCOPED
          exception to that rule (chartReveal.ts's own comment has the
          full reasoning), not a reversal of it. bleed also gets a taller
          320px (vs. every other usage's 200px) — direct feedback
          (2026-08-17): "make the chart on asset detail larger height." */}
      <ResponsiveContainer width="100%" height={bleed ? (bleedHeight ?? 320) : 200}>
        <ComposedChart data={rows} {...(bleed ? { margin: { top: 0, right: 0, bottom: 0, left: 0 } } : {})}>
          <defs>
            {/* --tint-subtle unconditionally now (2026-08-18 sweep — direct
                feedback: "all gradients... key issues, bullish, bearish,
                and anywhere, basically, notable price movements should be
                subtle, we added that scale" — supersedes the 2026-08-17
                round's own "bleed only, every other usage keeps 0.35"
                scoping, confirmed via AskUserQuestion this round applies
                app-wide, not just Entity Detail). No more bleed branch:
                both paths converged on the same value, so the conditional
                that existed only to keep them apart is gone too. SVG's
                stop-opacity presentation attribute reads CSS custom
                properties via style, not the numeric stopOpacity prop,
                which only accepts a literal number. */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-signal)" style={{ stopOpacity: 'var(--tint-subtle)' }} />
              <stop offset="100%" stopColor="var(--accent-signal)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--edge)" vertical={false} />
          <ChartBleedAxes
            bleed={bleed}
            rightAxisSeriesId={rightAxisSeriesId}
            yAutoScale={yAutoScale}
            {...(xTicks ? { xTicks } : {})}
            {...(xTickFormatter ? { xTickFormatter } : {})}
            {...(airy ? { airy } : {})}
          />
          <Tooltip content={TokenTooltip} cursor={{ stroke: 'var(--edge)' }} />

          <ChartReferenceLines referenceLines={referenceLines} annotations={annotations} />

          {isCombo &&
            data.series.map((line, index) => (
              <Bar
                key={line.id}
                yAxisId={line.id === rightAxisSeriesId ? 'right' : 'left'}
                dataKey={line.id}
                name={line.label}
                fill={SERIES_COLORS[index] ?? 'var(--viz-4)'}
                fillOpacity="var(--tint-subtle)"
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
              isAnimationActive={!!bleed}
              animationDuration={reveal.animationDuration}
              animationEasing={reveal.animationEasing}
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
    </>
  );

  if (!glow) {
    return <div style={{ display: 'grid', gap: 'var(--space-8)' }}>{chart}</div>;
  }

  return (
    <div
      className={`${glowStyles.root} ${glowStyles.bottom} ${glowStyles.clipped}`}
      style={{ '--glow-strength': 'var(--tint-subtle)' } as React.CSSProperties}
    >
      <div className={glowStyles.content} style={{ display: 'grid', gap: 'var(--space-8)' }}>
        {chart}
      </div>
    </div>
  );
}
