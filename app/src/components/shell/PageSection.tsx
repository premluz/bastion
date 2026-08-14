import type { CSSProperties, ReactNode } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';

// Shell-level counterpart to nodes/Panel.tsx, NOT a re-export of it: Panel
// is a registered registry node (Zod-validated, mounted only through
// SceneRenderer per CLAUDE.md rule 2 — "never import a component anywhere
// except the registry and its own story/test"). Page sections (Discover's
// Notable movers/Trending/Newly Added/Discover Assets, Watchlist,
// Data Sources) are application code with no Scene JSON behind them, so
// importing Panel directly would cross the one-way dependency direction
// (registry ← renderer ← engine ← app) the wrong way. This file exists so
// application code gets the identical bordered-pane look via its own
// import, not by reaching into the registry layer.
//
// Direct order, 2026-08-08: "each section must go with that pane that is
// using same class so we can ensure consistency" — every named page
// section (Notable movers, Trending, Newly Added, Discover Assets,
// Watchlist, Data Sources' connected/session/catalog lists) wraps in this,
// using panelFlat, the SAME class Panel/SceneSummary now use after
// panelProvisional's retirement (see theme.default.css's own note).
// Visual output is deliberately byte-identical to Panel — same Card
// variant/padding/class, same title row, same content grid — so the two
// components read as one system despite being architecturally separate.
const contentStyle: CSSProperties = {
  display: 'grid',
  gap: 'var(--space-2',
  minWidth: 0,
  ['--container-padding-block-start' as string]: '0px',
  ['--container-padding-block-end' as string]: '0px',
};

interface PageSectionProps {
  title?: ReactNode;
  source?: ReactNode;
  children?: ReactNode;
}

export function PageSection({ title, source, children }: PageSectionProps) {
  return (
    <Card variant="default" padding={4} className="panelFlat">
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
