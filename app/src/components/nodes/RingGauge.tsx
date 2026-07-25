import { arc } from 'd3-shape';
import { Text } from '@astryxdesign/core/Text';
import type { RingGaugeProps } from '../../contracts/props/ring-gauge';

const VIEW_SIZE = 100;
const CENTER = VIEW_SIZE / 2;
const OUTER_RADIUS = 42;
const INNER_RADIUS = 32;
const FULL_TURN = 2 * Math.PI;

const TONE_TO_TOKEN = {
  ok: 'var(--accent-ok)',
  warn: 'var(--accent-warn)',
  alert: 'var(--accent-alert)',
} as const;

const arcGenerator = arc();

// "How much of a bounded limit is used, at a glance?" (node-vocabulary.md,
// Phase 12) — a restrained ring + centered numeral, d3-shape's arc() for
// the path math (already-approved, Phase 8E), no chart library. Facts
// register, never confidence-meter's register (principle 3) — tone is
// authored, not derived, same fixed ok/warn/alert semantics as status-tag.
export function RingGauge({ label, value, max, unit, tone }: RingGaugeProps) {
  const ratio = Math.min(Math.max(value / max, 0), 1);
  const percent = Math.round((value / max) * 100);
  const trackPath = arcGenerator({ innerRadius: INNER_RADIUS, outerRadius: OUTER_RADIUS, startAngle: 0, endAngle: FULL_TURN }) ?? '';
  const fillPath =
    ratio > 0
      ? arcGenerator({ innerRadius: INNER_RADIUS, outerRadius: OUTER_RADIUS, startAngle: 0, endAngle: ratio * FULL_TURN })
      : null;
  const valueLabel = unit ? `${value}${unit}` : String(value);
  const maxLabel = unit ? `${max}${unit}` : String(max);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', justifyItems: 'center' }}>
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        width="100%"
        style={{ maxWidth: '160px', aspectRatio: '1 / 1', display: 'block' }}
        role="img"
        aria-label={`${label}: ${valueLabel} of ${maxLabel}, ${percent}%`}
      >
        {/* d3-shape's arc() paths are drawn relative to (0,0) — this <g>
            recenters them on the viewBox. Track uses --edge, not
            --surface-2: confirmed live that --surface-2 (Astryx's card
            background) renders identical to the bare canvas in the
            default theme, making a --surface-2 track invisible whenever
            the gauge isn't sitting inside its own Card — --edge is an
            alpha overlay, built to read against any surface underneath
            it, same reasoning ConcentrationMap's cell stroke already
            relies on. */}
        <g transform={`translate(${CENTER}, ${CENTER})`}>
          <path d={trackPath} fill="var(--edge)" />
          {/* Live-mutation path (liveChannel's update-in-place push):
              transitioning the `d` attribute directly lets the arc sweep
              to a new value when this same node re-renders with a patched
              scene, rather than snapping — d3-shape's arc() always emits
              the same path-command structure for a given radius pair, so
              the browser can interpolate between two draws of it. Timing
              from existing motion tokens only (rule 15), no new ones. */}
          {fillPath && (
            <path d={fillPath} fill={TONE_TO_TOKEN[tone]} style={{ transition: 'd var(--duration-480) var(--ease-decel)' }} />
          )}
        </g>
        <text
          x={CENTER}
          y={CENTER}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontFamily="var(--face-data)"
          style={{ fontVariantNumeric: 'tabular-nums' }}
          fill="var(--ink-primary)"
        >
          {percent}%
        </text>
      </svg>
      <div style={{ display: 'grid', gap: 'var(--space-4)', justifyItems: 'center', textAlign: 'center' }}>
        <Text type="label" color="secondary" display="block">
          {label}
        </Text>
        <Text type="supporting" hasTabularNumbers display="block">
          {valueLabel} of {maxLabel}
        </Text>
      </div>
    </div>
  );
}
