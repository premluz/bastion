import type { ReactNode } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import glowStyles from '../../theme/glow.module.css';
import styles from './PanelWithAction.module.css';

interface PanelWithActionProps {
  title: string;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
  /* Pane-edge glow (2026-08-19, direct feedback: "notable price movements
     the bottom gradient should be applied to pane (card) rather than
     component of timeline itself, cards should easily also have gradient
     glow system as we have it defined") — was previously wired PER
     CONSUMER (PriceMovementTimeline.tsx, EarningsHistoryChart.tsx each
     wrapped their own inner content in glowStyles.root/.bottom/.clipped,
     nested INSIDE this Card, so the glow sat against the content's own
     padded edge rather than the card's true edge). Moved here instead —
     the card itself owns the glow, any content renders inside it
     unchanged, no per-node glow-wrapping duplicated across every chart/
     timeline component that might want one. `glowColor` optional
     (defaults to glow.module.css's own --accent-signal) for the rare
     data-driven case (TrendChart's own --delta-up/--delta-down by trend
     direction stays local to that component, unchanged — it's not one of
     this card's own consumers and has a genuinely different geometry:
     full-bleed content, not an inset Card body). */
  glow?: boolean;
  glowColor?: string;
}

// Perplexity-style side-card header: title + a ghost "See all" link button
// in the same row, replacing the whole-pane ClickableCard these three cards
// (Analyst consensus, Why is this moving, Notable price movement) used
// before (direct feedback, 2026-08-15: "remove clickable pane on the side
// ... we need link button or ghost button, see all"). Shell-level only
// (components/shell/, not components/nodes/) — an onClick handler is a
// real prop here, not a scene-JSON-compatible one, so this can't be Panel
// itself (a registry node, Zod-validated props only per CLAUDE.md rule 7).
// Reuses Panel's own visual framing (Card variant="default" padding={4}
// panelFlat) rather than importing Panel, since Panel's title row has no
// action slot and adding one would require a ReactNode prop on a registry
// node's Zod schema — not possible, not attempted.
export function PanelWithAction({ title, actionLabel, onAction, children, glow, glowColor }: PanelWithActionProps) {
  return (
    <Card
      variant="default"
      padding={4}
      className={`panelFlat${glow ? ` ${glowStyles.root} ${glowStyles.bottom} ${glowStyles.clipped}` : ''}`}
      {...(glow ? { style: { '--glow-strength': 'var(--tint-subtle)', ...(glowColor ? { '--glow-color': glowColor } : {}) } as React.CSSProperties } : {})}
    >
      <div className={glow ? glowStyles.content : undefined}>
        <div className={styles.headerRow}>
          <Text type="label">{title}</Text>
          <Button
            label={actionLabel}
            variant="ghost"
            size="sm"
            endContent={<Icon icon="chevronRight" size="sm" />}
            onClick={onAction}
          />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </Card>
  );
}
