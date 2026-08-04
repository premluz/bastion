import { useEffect, useRef, useState } from 'react';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import type { MetricProps } from '../../contracts/props/metric';
import { Sparkline } from './Sparkline';

// trend (Phase 8E) reuses the sparkline node's own component directly —
// same precedent as StatusTag being imported by EntityHeader: a registry
// node may be imported by another node component when the reuse is real.
//
// Label-leads order (2026-07-27, direct order, global — Trend, Statistics,
// and About all share this one component): label renders first/top,
// numeral second/below. node-vocabulary.md's "big numeral, quiet label"
// describes relative visual WEIGHT, not DOM order — numeral stays large
// and bold, label stays small and secondary; only which one leads changed.
export function Metric({ label, value, unit, detail, trend, size = 'default' }: MetricProps) {
  // Live-mutation flash (liveChannel's update-in-place push, 2026-07-25):
  // a literal-prop node has no continuous quantity to sweep like
  // ring-gauge's arc — a numeral just changes — so "animate to new
  // values" here means a brief accent flash on the value actually
  // changing, timed from existing motion tokens only. Local, prop-driven
  // state only (no store/engine reach), same standing as EntityLink's own
  // hover state — still a pure, dumb component.
  const previousValue = useRef(value);
  const [isUpdated, setIsUpdated] = useState(false);
  useEffect(() => {
    if (previousValue.current === value) return;
    previousValue.current = value;
    setIsUpdated(true);
    const timeout = setTimeout(() => setIsUpdated(false), 480);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <Text type="label" color="secondary" display="block">
        {label}
      </Text>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-12)' }}>
        {size === 'compact' ? (
          <Text
            // One step down from large (17px) — direct feedback,
            // 2026-08-02 — lands on body (14px), the same size as the
            // label above it; weight (semibold vs regular) and color
            // (primary vs secondary) are what still separate them.
            type="body"
            weight="semibold"
            hasTabularNumbers
            display="block"
            style={{
              color: isUpdated ? 'var(--accent-signal)' : 'var(--ink-primary)',
              transition: 'color var(--duration-480) var(--ease-decel)',
            }}
          >
            {unit ? `${value} ${unit}` : value}
          </Text>
        ) : (
          // One size step down from Text's display-3 (29px) — direct
          // feedback, 2026-08-02. Text's own scale has no step between
          // display-3 and large (17px, already used by size="compact"
          // above); Heading's natural (untyped) level-2 styling is the
          // next real step down (20px) without colliding with compact.
          // Heading has no weight/hasTabularNumbers props of its own
          // (fixed per-level weight) — tabular alignment restored via the
          // matching CSS property directly.
          <Heading
            level={2}
            display="block"
            style={{
              fontVariantNumeric: 'tabular-nums',
              color: isUpdated ? 'var(--accent-signal)' : 'var(--ink-primary)',
              transition: 'color var(--duration-480) var(--ease-decel)',
            }}
          >
            {unit ? `${value} ${unit}` : value}
          </Heading>
        )}
        {trend && <Sparkline points={trend} />}
      </div>
      {detail && (
        <Text type="supporting" display="block">
          {detail}
        </Text>
      )}
    </div>
  );
}
