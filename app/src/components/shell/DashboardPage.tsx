import type { MouseEvent, ReactNode } from 'react';
import { PageShell } from './PageShell';
import { DashboardSummaryHeader } from './DashboardSummaryHeader';
import { DashboardLayout } from '../nodes/DashboardLayout';
import { resolveClickedEntityId } from '../../engine/entityLinkClick';
import { usePageStore } from '../../engine/stores/pageStore';

interface DashboardHeaderData {
  recommendation: string;
  confidence: number;
  confidenceLabel: string;
  sourceRefs: string[];
  assumptions?: string[];
  caveat?: string;
}

interface DashboardPageProps {
  title: string;
  header: DashboardHeaderData;
  children: ReactNode;
  columns?: number;
  spans?: readonly (number | 'full')[];
}

// Phase 13: the shared shape every static dashboard page composes into —
// PageShell chrome + DashboardSummaryHeader (conclude-then-substantiate,
// static form) + DashboardLayout (reused directly, same as node-
// vocabulary.md's own "distinct from scene-grid" primitive) around
// whatever registry nodes the concrete page authors as children. No
// SceneRenderer, no trail, no submitQuery — a page passes its own
// authored data straight into real component props.
//
// columns/spans pass straight through to DashboardLayout, overriding its
// config.ts default when given — needed here because the header renders
// OUTSIDE DashboardLayout (a page header, not a dashboard card), unlike
// the scene-driven dashboard-layout usage where scene-summary IS its own
// first child. That one-position shift means the shared config default
// (authored around scene-summary occupying slot 0) doesn't line up for a
// static page's own, one-shorter children list — an explicit override
// here, not a change to the shared default other dashboard-layout
// consumers still rely on.
//
// Entity-link delegated listener (Portfolio wiring order, 2026-07-25):
// same mechanism as Canvas.tsx's own (data-entity-id + resolveClickedEntityId
// from entityLinkClick.ts), but routed to openEntityDetail rather than
// submitQuery — a static dashboard page browses first (Phase 16's "browse
// first, investigate second" law), it never has its own trail/turn to
// investigate INTO. Lives here rather than per-page so any future static
// dashboard gets entity-link support for free, same "extend before
// duplicating" precedent as everything else this session.
export function DashboardPage({ title, header, children, columns, spans }: DashboardPageProps) {
  const openEntityDetail = usePageStore((state) => state.openEntityDetail);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const entityId = resolveClickedEntityId(event);
    if (entityId) openEntityDetail(entityId);
  };

  return (
    <PageShell title={title}>
      <div style={{ display: 'grid', gap: 'var(--space-16)' }} onClick={handleClick}>
        <DashboardSummaryHeader {...header} />
        <DashboardLayout {...(columns !== undefined ? { columns } : {})} {...(spans !== undefined ? { spans } : {})}>
          {children}
        </DashboardLayout>
      </div>
    </PageShell>
  );
}
