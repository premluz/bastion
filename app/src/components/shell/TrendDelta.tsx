import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';

interface TrendDeltaProps {
  value: number;
}

// Reusable directional trend indicator (arrow + colored percentage) — a
// financial-platform convention used across the crypto/equity table
// columns (EntityAssetTableCryptoColumns.tsx) and the Discover strips
// (EntityDiscoveryStrips.tsx), factored out once it appeared in both
// places (direct feedback, 2026-08-01). Always renders a percent sign —
// no "pp" variant: direct feedback ruled this is "the percentage
// component," full stop, so every value it displays reads as a percentage
// regardless of the underlying metric's real unit. Text's own `color`
// prop has no semantic success/error member (only primary/secondary/
// disabled/placeholder/accent/inherit), so the up/down color is a direct
// `--delta-up`/`--delta-down` CSS-var style, same workaround already
// established where this logic used to live inline.
export function TrendDelta({ value }: TrendDeltaProps) {
  const isUp = value >= 0;
  const sign = value > 0 ? '+' : '';
  const color = isUp ? 'var(--delta-up)' : 'var(--delta-down)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      <Icon icon={isUp ? 'arrowUp' : 'arrowDown'} size="sm" style={{ color }} />
      <Text type="supporting" style={{ color }} hasTabularNumbers>
        {sign}
        {value.toFixed(2)}%
      </Text>
    </div>
  );
}
