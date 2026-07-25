import { Grid } from '@astryxdesign/core/Grid';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { StatusGridProps } from '../../contracts/props/status-grid';

const TONE_TO_VARIANT = {
  ok: 'success',
  warn: 'warning',
  alert: 'error',
  neutral: 'neutral',
} as const;

// "What's the state of many things at once, scannable in one glance?"
// (node-vocabulary.md, Phase 12) — status-tag's own fixed tone
// semantics, reused per cell via Astryx's StatusDot (found via
// `astryx component --list`: "small colored dot... always pair with a
// visible text label" — exactly this shape), laid out in Astryx's own
// responsive Grid. No custom SVG — both primitives wrapped directly.
export function StatusGrid({ title, data, labelColumn, toneColumn }: StatusGridProps) {
  if (data.rows.length === 0) {
    return <EmptyState title="No status data" description="No rows returned for this breakdown." />;
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      {title && <Text type="label">{title}</Text>}
      <Grid columns={{ minWidth: 140 }} gap={3}>
        {data.rows.map((row, index) => {
          const label = String(row[labelColumn] ?? '—');
          const tone = row[toneColumn] as keyof typeof TONE_TO_VARIANT;
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <StatusDot variant={TONE_TO_VARIANT[tone]} label={label} />
              <Text type="supporting" display="block">
                {label}
              </Text>
            </div>
          );
        })}
      </Grid>
    </div>
  );
}
