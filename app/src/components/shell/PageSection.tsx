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
  gap: 'var(--space-16)',
  minWidth: 0,
  ['--container-padding-block-start' as string]: '0px',
  ['--container-padding-block-end' as string]: '0px',
  // Publishes this pane's own inset for bleed.module.css's sake (see that
  // file's contract) — kept identical to Panel.tsx's own line, since this
  // component's whole purpose is to be visually byte-identical to Panel
  // (see the comment above); a bleeding child must behave the same inside
  // either one.
  ['--pane-inset' as string]: 'var(--space-16)',
};

interface PageSectionProps {
  title?: ReactNode;
  source?: ReactNode;
  /* Arbitrary interactive content (e.g. a view-mode ToggleButtonGroup),
     rendered raw in the title row's end slot — NOT wrapped in <Text>
     like `source` (2026-08-18 addition, direct feedback: "grid list view
     should be in same line/row as title, similarly like artifacts pane
     has options there [close and expand]"). Kept as its own prop rather
     than repurposing `source`: `source` is a text-only slot (every
     existing caller passes a plain string/label, e.g. a citation),
     wrapping a real component in Text would be wrong for both the new
     and every existing use. Mutually exclusive with `source` in
     practice (no current caller needs both), but not enforced — the
     title row's flex layout has room for at most one end-aligned item
     today. */
  actions?: ReactNode;
  /* Same opt-out as Panel.tsx's own `bordered` prop (2026-08-19, direct
     feedback: "should have config for no border") — default true,
     matching the 2026-08-08 order this file's own comment already cites.
     `bordered={false}` switches to panelFlatNoBorder, kept in sync with
     Panel.tsx so the two stay visually identical by construction, same
     as every other class this component mirrors. */
  bordered?: boolean;
  children?: ReactNode;
}

export function PageSection({ title, source, actions, bordered = true, children }: PageSectionProps) {
  return (
    <Card variant="default" padding={4} className={bordered ? 'panelFlat' : 'panelFlatNoBorder'}>
      {(title ?? source ?? actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-12)' }}>
          {title && <Text type="label">{title}</Text>}
          {source && <Text type="supporting">{source}</Text>}
          {actions}
        </div>
      )}
      <div style={contentStyle}>{children}</div>
    </Card>
  );
}
