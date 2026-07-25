import { useEffect, useRef, useState } from 'react';
import { Text } from '@astryxdesign/core/Text';
import type { MetricProps } from '../../contracts/props/metric';
import { Sparkline } from './Sparkline';

// trend (Phase 8E) reuses the sparkline node's own component directly —
// same precedent as StatusTag being imported by EntityHeader: a registry
// node may be imported by another node component when the reuse is real.
export function Metric({ label, value, unit, detail, trend }: MetricProps) {
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
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-12)' }}>
        <Text
          type="display-3"
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
        {trend && <Sparkline points={trend} />}
      </div>
      <Text type="label" color="secondary" display="block">
        {label}
      </Text>
      {detail && (
        <Text type="supporting" display="block">
          {detail}
        </Text>
      )}
    </div>
  );
}
