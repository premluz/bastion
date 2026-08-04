import { useId } from 'react';
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
// transparent, same register and token reuse).
export function Sparkline({ points }: SparklineProps) {
  const gradientId = useId();

  if (points.length < 2) return null;

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
          <stop offset="0%" stopColor="var(--accent-signal)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="var(--accent-signal)" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke="var(--accent-signal)" strokeWidth={1.5} />
    </svg>
  );
}
