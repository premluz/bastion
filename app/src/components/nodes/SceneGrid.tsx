import type { ReactNode } from 'react';
import { Grid, type GridColumns } from '@astryxdesign/core/Grid';
import type { SceneGridProps } from '../../contracts/props/scene-grid';

// The schema's optional keys may be `undefined`, which Astryx's GridColumns
// (exactOptionalPropertyTypes) rejects — absent keys are omitted instead.
function toGridColumns(columns: NonNullable<SceneGridProps['columns']>): GridColumns {
  if (typeof columns === 'number') return columns;
  return {
    minWidth: columns.minWidth,
    ...(columns.max !== undefined ? { max: columns.max } : {}),
    ...(columns.repeat !== undefined ? { repeat: columns.repeat } : {}),
  };
}

export function SceneGrid({ columns = 1, children }: SceneGridProps & { children?: ReactNode }) {
  return (
    <Grid columns={toGridColumns(columns)} gap={4}>
      {children}
    </Grid>
  );
}
