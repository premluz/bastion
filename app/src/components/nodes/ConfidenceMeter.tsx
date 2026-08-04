import { arc } from 'd3-shape';
import { Text } from '@astryxdesign/core/Text';
import { confidenceQualifier } from '../../contracts/thinking';
import type { ConfidenceMeterProps } from '../../contracts/props/confidence-meter';

type Qualifier = ReturnType<typeof confidenceQualifier>;

const VIEW_SIZE = 100;
const CENTER = VIEW_SIZE / 2;
const OUTER_RADIUS = 42;
const INNER_RADIUS = 32;
const FULL_TURN = 2 * Math.PI;

// Same tokens RingGauge's own tone map uses (Phase 12) — high/moderate/low
// carry the same success/accent/warning meaning the old ProgressBar
// `variant` prop expressed, just addressed as raw tokens now that this is
// hand-drawn SVG rather than a variant prop on a component.
const QUALIFIER_TO_TOKEN: Record<Qualifier, string> = {
  high: 'var(--accent-ok)',
  moderate: 'var(--accent-signal)',
  low: 'var(--accent-warn)',
};

const arcGenerator = arc();

// Circular gauge (2026-07-27, direct order — supersedes this node's prior
// "restrained horizontal gauge... never a gimmick dial" law, node-
// vocabulary.md's confidence-meter entry updated to match). d3-shape's
// arc() for the path math — already-approved (Phase 8E), and the exact
// pattern RingGauge (Phase 12) already draws its own ring with, reused
// here rather than reinvented. Confidence keeps its OWN register distinct
// from RingGauge's (node-vocabulary.md principle 3: confidence belongs to
// conclusions, never to facts) — this is a new rendering of that same
// register, not a reuse of RingGauge's authored ok/warn/alert tone,
// which is a fixed-limit-usage concept confidence doesn't share.
// hideCaption: scene-summary (2026-07-29) folds this same label/value into
// its own MetadataList alongside Sources/Unknowns/Assumptions, so the ring's
// own duplicate text caption would repeat it — a composition flag, not a
// scene-authorable fact, so it stays out of the Zod prop schema.
export function ConfidenceMeter({ label, value, hideCaption }: ConfidenceMeterProps & { hideCaption?: boolean }) {
  const qualifier = confidenceQualifier(value);
  const ratio = Math.min(Math.max(value, 0), 1);
  const percent = Math.round(value * 100);
  const trackPath = arcGenerator({ innerRadius: INNER_RADIUS, outerRadius: OUTER_RADIUS, startAngle: 0, endAngle: FULL_TURN }) ?? '';
  const fillPath =
    ratio > 0 ? arcGenerator({ innerRadius: INNER_RADIUS, outerRadius: OUTER_RADIUS, startAngle: 0, endAngle: ratio * FULL_TURN }) : null;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)', justifyItems: 'center' }}>
      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        width="100%"
        style={{ maxWidth: '120px', aspectRatio: '1 / 1', display: 'block' }}
        role="img"
        aria-label={`${label}: ${value.toFixed(2)}, ${qualifier}`}
      >
        {/* Track uses --edge, not --surface-2 — confirmed live (RingGauge's
            own comment): --surface-2 renders identical to the bare canvas
            in the default theme, making the track invisible outside a
            Card. --edge is an alpha overlay, built to read against any
            surface underneath it. */}
        <g transform={`translate(${CENTER}, ${CENTER})`}>
          <path d={trackPath} fill="var(--edge)" />
          {fillPath && (
            <path d={fillPath} fill={QUALIFIER_TO_TOKEN[qualifier]} style={{ transition: 'd var(--duration-480) var(--ease-decel)' }} />
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
      {!hideCaption && (
        <div style={{ display: 'grid', gap: 'var(--space-4)', justifyItems: 'center', textAlign: 'center' }}>
          <Text type="label" color="secondary" display="block">
            {label}
          </Text>
          <Text type="supporting" hasTabularNumbers display="block">
            {value.toFixed(2)} · {qualifier}
          </Text>
        </div>
      )}
    </div>
  );
}
