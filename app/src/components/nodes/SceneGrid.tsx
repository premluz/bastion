import type { ReactNode } from 'react';
import { Grid } from '@astryxdesign/core/Grid';
import type { SceneGridProps } from '../../contracts/props/scene-grid';

export function SceneGrid({ columns = 1, children }: SceneGridProps & { children?: ReactNode }) {
  return (
    <Grid columns={columns} gap={4}>
      {children}
    </Grid>
  );
}
