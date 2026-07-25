import type { CSSProperties, ReactNode } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import type { PanelProps } from '../../contracts/props/panel';

// Astryx's Table bleeds edge-to-edge when it's the first/last child of a
// padded container, via a negative margin equal to
// --container-padding-block-{start,end} (inherited from Card). A panel with
// multiple children defeats that assumption — every child independently
// qualifies as "first-child" of this wrapper and bleeds upward, exactly
// canceling the gap below. Resetting the block-axis variables here (not the
// inline ones, which still usefully align column padding to the card inset)
// opts every child out of the bleed; single-child panels are unaffected in
// practice since Table already respects an explicit gap over an assumed one.
const contentStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--space-16)',
  // Grid's own min-width:auto default refuses to let this track shrink
  // below an unwrapped child's intrinsic width, so a long text child (e.g.
  // signal-feed's descriptions) forces the panel — and the dashboard-layout
  // cell it sits in — wider than its allotted span instead of wrapping.
  minWidth: 0,
  ['--container-padding-block-start' as string]: '0px',
  ['--container-padding-block-end' as string]: '0px',
};

export function Panel({ title, source, children }: PanelProps & { children?: ReactNode }) {
  return (
    <Card variant="default" padding={4}>
      {(title ?? source) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-12)' }}>
          {title && <Text type="label">{title}</Text>}
          {source && <Text type="supporting">{source}</Text>}
        </div>
      )}
      <div style={contentStyle}>{children}</div>
    </Card>
  );
}
