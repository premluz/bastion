import { Text } from '@astryxdesign/core/Text';
import type { TooltipContentProps } from 'recharts';

// Shared recharts craft primitives (Phase 8E) — NOT a registry node, just
// plain reuse between time-series and bar-series, same precedent as
// StatusTag being imported directly by EntityHeader. Kept here rather
// than duplicated in each chart component.

export function TabularTick({
  x,
  y,
  payload,
  textAnchor,
  dx,
  dy,
}: {
  x?: number;
  y?: number;
  payload?: { value: string | number };
  textAnchor: 'middle' | 'end';
  dx: number;
  dy: number;
}) {
  // Axis ticks are annotation, not UI chrome — both axes read as data
  // (dates, categories, numerals), so both get the data face + tabular
  // alignment, not just the numeric (Y) axis.
  return (
    <text
      x={(x ?? 0) + dx}
      y={(y ?? 0) + dy}
      fill="var(--ink-muted)"
      fontSize={11}
      fontFamily="var(--face-data)"
      textAnchor={textAnchor}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {payload?.value}
    </text>
  );
}

export function TokenTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--edge)',
        borderRadius: 'var(--radius-4)',
        padding: 'var(--space-8)',
        display: 'grid',
        gap: 'var(--space-4)',
      }}
    >
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      {payload.map((entry) => (
        <div key={entry.dataKey as string} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-16)' }}>
          <Text type="supporting">{entry.name}</Text>
          <Text type="supporting" hasTabularNumbers>
            {entry.value}
          </Text>
        </div>
      ))}
    </div>
  );
}
