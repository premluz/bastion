import { useId } from 'react';
import { AssetTrendGlyph, seriesIsUp } from './AssetTrendGlyph';
import { scaleLinear } from 'd3-scale';
import { line as d3line } from 'd3-shape';
import { area as d3area } from 'd3-shape';
import type { SparklineProps } from '../../contracts/props/sparkline';

const WIDTH = 80;
const HEIGHT = 24;
const INSET = 2;

// "What's the trend, in passing?" — a bare glyph, not a chart: no axes,
// no tooltip, no grid, one hue (--accent-signal only, never a second
// color). Custom SVG via d3-scale/d3-shape rather than recharts —
// recharts' ResponsiveContainer (ResizeObserver per instance) is real
// overhead for something meant to sit inline in a metric or a table
// cell, potentially many per screen. Principle 6 ("missing data is
// rendered explicitly") is deliberately not applied here the way a
// full-sized node would: an EmptyState card has no sensible inline
// reading next to a number or inside a table cell, so fewer than two
// points renders nothing rather than a placeholder — the enclosing
// metric/cell still shows its own real value regardless.
// Gradient styling matches TimeSeries node (signal hue fading to
// transparent, same register and token reuse). --tint-subtle (2026-08-18
// sweep — direct feedback: "all gradients that we use in key issues,
// bullish, bearish, and anywhere, basically, notable price movements
// should be subtle, we added that scale" — extends the Entity Detail-only
// scoping from the token's own introduction to every chart gradient app-
// wide, confirmed via AskUserQuestion). SVG's stop-opacity presentation
// attribute reads CSS custom properties via style, not the numeric
// stopOpacity prop (same constraint TimeSeries.tsx's own bleed path
// already worked around).
export function Sparkline({ points, variant }: SparklineProps) {
  const gradientId = useId();

  if (points.length < 2) return null;
  if (variant === 'block') return <AssetTrendGlyph points={points} isUp={seriesIsUp(points)} variant="block" />;

  const xScale = scaleLinear().domain([0, points.length - 1]).range([INSET, WIDTH - INSET]);
  const yValues = points.map((point) => point.y);
  const yScale = scaleLinear()
    .domain([Math.min(...yValues), Math.max(...yValues)])
    .range([HEIGHT - INSET, INSET]);

  const linePath = d3line<{ x: string; y: number }>()
    .x((_point, index) => xScale(index))
    .y((point) => yScale(point.y))(points);

  const areaPath = d3area<{ x: string; y: number }>()
    .x((_point, index) => xScale(index))
    .y0(HEIGHT - INSET)
    .y1((point) => yScale(point.y))(points);

  if (!linePath || !areaPath) return null;

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Trend sparkline">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-signal)" style={{ stopOpacity: 'var(--tint-subtle)' }} />
          <stop offset="100%" stopColor="var(--accent-signal)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke="var(--accent-signal)" strokeWidth={1.5} />
    </svg>
  );
}
