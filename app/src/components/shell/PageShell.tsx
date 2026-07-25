import type { ReactNode } from 'react';
import { Text } from '@astryxdesign/core/Text';

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
//
// Title style/weight/position matched to HomeTopBar's own (Text
// type="label" weight="semibold", same padding) per direct feedback —
// the two title bars read as one consistent chrome pattern now, not two
// independently-styled headers (the old Heading level={1} was
// noticeably larger/bolder, and this bar used a taller
// space-24/24/16 padding instead of HomeTopBar's 12/16). No border
// between title and content either, same feedback, same reasoning as
// HomeTopBar's own separator removal.
//
// Left/right padding matches the content row's own left/right padding
// below (var(--space-24), not the 16 the title bar used until this
// order) — reported live, with a screenshot, that the title sat visibly
// less indented than the list rows underneath it. HomeTopBar shares this
// exact fix (its own content below is also space-24 left/right) to keep
// the two title bars' position matched, per the same-position rule this
// file's own comment already states — fixing only one would have
// re-diverged them.
export function PageShell({ title, headerActions, children }: PageShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-12) var(--space-24)',
          flexShrink: 0,
        }}
      >
        <Text type="label" weight="semibold">
          {title}
        </Text>
        {headerActions}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-24)' }}>{children}</div>
    </div>
  );
}
