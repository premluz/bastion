import type { ReactNode } from 'react';
import { Grid } from '@astryxdesign/core/Grid';

export function MetricGrid({ children }: { children?: ReactNode }) {
  return (
    <Grid columns={{ minWidth: 160, max: 4 }} gap={4}>
      {children}
    </Grid>
  );
}
