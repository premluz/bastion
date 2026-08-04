import { EmptyState } from '@astryxdesign/core/EmptyState';

// Phase 18, tier 3's approved substitute: a plain, honest fence — same
// register as every other session-scoped/desktop-only disclosure already
// in this app (Watchlist, Data Sources' mock catalog), not a broken or
// half-rendered layout. Rendered instead of the whole app shell, not
// alongside it — nothing multi-pane mounts underneath.
export function DesktopOnlyNotice() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100dvh', padding: 'var(--space-24)' }}>
      <EmptyState
        title="Merlin is designed for larger screens"
        description="This interface assembles multiple panes side by side and needs more room to do that well. Widen your browser window or switch to a larger screen."
      />
    </div>
  );
}
