import type { CSSProperties, ReactNode } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import type { PanelProps } from '../../contracts/props/panel';
import glowStyles from '../../theme/glow.module.css';
import styles from './Panel.module.css';

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
  // Publishes this pane's own inset for bleed.module.css's sake (see that
  // file's contract): Card padding={4} below resolves to --space-16, so a
  // child applying bleed's .inline/.blockEnd cancels exactly that, without
  // hardcoding the number itself. If this Card's padding ever changes,
  // this one line changes with it and every bleeding child follows.
  ['--pane-inset' as string]: 'var(--space-16)',
};

// glow/glowColor (2026-08-19, direct feedback: "cards should easily also
// have gradient glow system as we have it defined") — kept OUTSIDE
// PanelPropsSchema, same posture as `children`: neither is scene-JSON
// serializable, so both live only in this intersection type, not the
// registry-validated Zod schema. Same wiring PanelWithAction.tsx now
// uses (that file's own comment has the fuller rationale) — the card
// itself owns the glow, whatever content renders inside it is unchanged.
//
// bordered (2026-08-19, same-round follow-up, direct feedback: "should
// have config for no border") — default true, matching the standing
// 2026-08-08 order ("every content block gets the identical bordered
// treatment," see theme.default.css's own panelFlat comment) unchanged
// for every existing caller. `bordered={false}` switches to
// panelFlatNoBorder (new sibling class, all 5 theme files) — same
// background, border removed. Kept outside PanelPropsSchema too, same
// non-serializable posture as glow/children.
export function Panel({
  title,
  source,
  children,
  glow,
  glowColor,
  bordered = true,
}: PanelProps & { children?: ReactNode; glow?: boolean; glowColor?: string; bordered?: boolean }) {
  const baseClass = bordered ? 'panelFlat' : 'panelFlatNoBorder';
  return (
    <Card
      variant="default"
      padding={4}
      className={`${baseClass}${glow ? ` ${glowStyles.root} ${glowStyles.bottom} ${glowStyles.clipped}` : ''}`}
      {...(glow ? { style: { '--glow-strength': 'var(--tint-subtle)', ...(glowColor ? { '--glow-color': glowColor } : {}) } as React.CSSProperties } : {})}
    >
      <div className={glow ? glowStyles.content : undefined}>
        {(title ?? source) && (
          <div className={styles.headerRow}>
            {title && <Text type="label">{title}</Text>}
            {source && (
              <Text type="supporting" maxLines={1} className={styles.source}>
                {source}
              </Text>
            )}
          </div>
        )}
        <div style={contentStyle}>{children}</div>
      </div>
    </Card>
  );
}
