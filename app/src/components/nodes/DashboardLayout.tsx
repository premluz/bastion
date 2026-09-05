import { Children, type ReactNode } from 'react';
import { Grid, GridSpan, type GridColumns } from '@astryxdesign/core/Grid';
import { config } from '../../config';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  // GridColumns (Astryx's own union, 2026-08-30 follow-up: "panes should
  // be responsive and fluid... on mobile or small space stack") widens
  // this beyond a fixed number — additive, every existing numeric caller
  // (config.ts default, most scene dashboards) is unaffected. A caller
  // that wants true reflow-to-stacking passes the responsive object
  // form instead (columns={{ minWidth, max, repeat: 'fit' }}) — see
  // EntityAssetGrid.tsx/AssetCardGrid.tsx for the first real consumers.
  columns?: GridColumns;
  spans?: readonly (number | 'full')[];
  children?: ReactNode;
}

// A denser stage than scene-grid, same standing (node-vocabulary.md) —
// distinct in exactly one capability: per-child spanning via Astryx's
// GridSpan, which scene-grid has no mechanism for at all. columns/spans
// default from config.ts, never from scene JSON (Prem's instruction) —
// the optional props below exist for Storybook's own args, which bypass
// the registry/scene pipeline entirely, same as every other node's story.
export function DashboardLayout({
  columns = config.dashboardLayout.columns,
  spans = config.dashboardLayout.spans,
  children,
}: DashboardLayoutProps) {
  const items = Children.toArray(children);
  return (
    <div className={styles.container}>
      <Grid columns={columns} gap={4} className={styles.grid}>
        {items.map((child, index) => (
          <GridSpan key={index} columns={spans[index] ?? 1}>
            {child}
          </GridSpan>
        ))}
      </Grid>
    </div>
  );
}
