import { Text } from '@astryxdesign/core/Text';
import type { MetricProps } from '../../contracts/props/metric';
import { Sparkline } from './Sparkline';

// trend (Phase 8E) reuses the sparkline node's own component directly —
// same precedent as StatusTag being imported by EntityHeader: a registry
// node may be imported by another node component when the reuse is real.
export function Metric({ label, value, unit, detail, trend }: MetricProps) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-12)' }}>
        <Text type="display-3" weight="semibold" hasTabularNumbers display="block">
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
