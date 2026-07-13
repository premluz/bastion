import type { ReactNode } from 'react';
import { Heading } from '@astryxdesign/core/Heading';

interface PageShellProps {
  title: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

// Shared full-width page chrome (Phase 8H) — title + optional header
// actions (Investigations' view toggle, a future page's own controls)
// + scrollable content. Replaces Phase 8G's IndexPaneShell now that
// Entities/Watchlist/Data Sources are pages, not narrow resizable side
// panes: no width prop, no close button (pages are navigated away from,
// never closed), full main-content-area layout instead of a Card.
export function PageShell({ title, headerActions, children }: PageShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-24) var(--space-24) var(--space-16)',
          borderBottom: '1px solid var(--edge)',
          flexShrink: 0,
        }}
      >
        <Heading level={1}>{title}</Heading>
        {headerActions}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-24)' }}>{children}</div>
    </div>
  );
}
