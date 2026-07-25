import { Children, type ReactNode } from 'react';
import { Grid, GridSpan } from '@astryxdesign/core/Grid';
import { config } from '../../config';

interface DashboardLayoutProps {
  columns?: number;
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
    <Grid columns={columns} gap={4}>
      {items.map((child, index) => (
        <GridSpan key={index} columns={spans[index] ?? 1}>
          {child}
        </GridSpan>
      ))}
    </Grid>
  );
}
