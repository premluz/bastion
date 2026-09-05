import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { ContributionBarsProps } from '../../contracts/props/contribution-bars';
import { TabularTick, TokenTooltip } from './chartCraft';
import { getChartRevealAnimation } from './chartReveal';

// "What drove this one outcome, ranked by contribution?" (node-vocabulary.md,
// Phase 21 follow-up) — bar-series compares bar HEIGHTS across categories/
// periods on a shared vertical axis (a distribution); this node answers a
// different question, several named factors behind ONE outcome, each its
// own horizontal bar, sorted by size. Custom via recharts (same craft as
// bar-series: token colors, tabular-numeral ticks, tooltip through
// TokenTooltip) — BarChart layout="vertical" is recharts' own name for
// horizontal bars (axes swap: YAxis carries the category labels, XAxis the
// numeric scale).
//
// Row order is authored, never sorted client-side — same "order preserved,
// not computed" discipline concentration-map's own vocabulary entry
// established: a scene author ranks the drivers, this node renders exactly
// that order top-to-bottom (recharts' own category-axis convention already
// reads first-row-at-top for a vertical layout).
export function ContributionBars({ title, valueSuffix, data }: ContributionBarsProps) {
  // Named, scoped rule-15 exception (2026-08-31, direct feedback: "the new
  // contribution chart should also animate") — same reveal chartReveal.ts
  // already documents for TimeSeries.tsx's own bleed chart and
  // AssetTrendGlyph.tsx's sparklines: a chart's own intrinsic draw-in,
  // token-timed, not the renderer's scene-assembly stagger this rule
  // otherwise governs. Read once per mount, not per-render, per the same
  // precedent.
  const reveal = useMemo(() => getChartRevealAnimation(), []);
  const series = data.series[0];
  if (!series || series.points.length === 0) {
    return <EmptyState title="No contribution data" description="No ranked drivers returned for this query." />;
  }

  const rows = series.points.map((point) => ({ x: point.x, y: point.y }));
  const suffix = valueSuffix ?? '%';
  // 44px/row, not bar-series's own denser packing — this axis carries a
  // real text label per row (bar-series's own x-axis is a compact tick),
  // and a tight row height let recharts' own auto-tick-thinning silently
  // drop alternating category labels (confirmed live: "Governance /
  // Buyback" and "Staking growth" vanished at 32px/row, only every other
  // row's label rendered) — the same class of bug TrendChart.tsx's own
  // explicit-ticks fix already documents for a continuous axis, here on
  // a categorical one instead. interval={0} on YAxis (below) is the
  // actual fix; the taller row height keeps the forced labels legible
  // rather than merely present but overlapping.
  const rowHeight = 44;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      {title && <Text type="label">{title}</Text>}
      <ResponsiveContainer width="100%" height={rows.length * rowHeight}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--edge)" horizontal={false} />
          <XAxis
            type="number"
            tick={<TabularTick textAnchor="middle" dx={0} dy={12} tickFormatter={(value) => `${value}${suffix}`} />}
          />
          <YAxis type="category" dataKey="x" width={160} interval={0} tick={<TabularTick textAnchor="end" dx={-8} dy={4} />} />
          <Tooltip content={TokenTooltip} cursor={{ fill: 'var(--surface-2)' }} />
          <Bar
            dataKey="y"
            name={series.label}
            fill="var(--accent-signal)"
            isAnimationActive
            animationDuration={reveal.animationDuration}
            animationEasing={reveal.animationEasing}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
