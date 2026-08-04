import type { ReactNode } from 'react';
import { Grid } from '@astryxdesign/core/Grid';

interface MetricGridProps {
  children?: ReactNode;
  // minWidth/maxColumns (2026-07-27): additive, defaults preserve the
  // exact prior 160/4 behavior for every scene-JSON usage. The registered
  // `metric-grid` Zod contract stays `z.object({})` — "no authored knobs
  // of its own" — these two are reachable only via a direct shell import
  // (EntityDetailPage's About section, same Phase 13 rule-1 shell
  // exception already used elsewhere on that page), never from scene
  // JSON. About needs up to 6 columns for its denser fact list, wider
  // than metric-grid's original "2-4 vital signs" framing (node-
  // vocabulary.md) — auto-fit still reflows to fewer columns as the
  // container narrows, same mechanism, just a higher cap and a smaller
  // minWidth floor for that one call site.
  minWidth?: number;
  maxColumns?: number;
}

export function MetricGrid({ children, minWidth = 160, maxColumns = 4 }: MetricGridProps) {
  return (
    <Grid columns={{ minWidth, max: maxColumns }} gap={4}>
      {children}
    </Grid>
  );
}
