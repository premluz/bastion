import { ListItem } from '@astryxdesign/core/List';
import { StatusDot, type StatusDotVariant } from '@astryxdesign/core/StatusDot';
import type { ThreadSummary } from '../../engine/threads';

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function statusDot(thread: ThreadSummary, module: string | undefined): { variant: StatusDotVariant; label: string } {
  const { latestTurn } = thread;
  if (latestTurn.status === 'unresolved') return { variant: 'neutral', label: 'No match' };
  if (latestTurn.status === 'interrupted') return { variant: 'neutral', label: 'Interrupted' };
  if (!latestTurn.artifactRef) return { variant: 'accent', label: 'Thinking…' };
  return module === 'monitor' ? { variant: 'error', label: 'Alert' } : { variant: 'success', label: 'Answered' };
}

// Extracted from InvestigationsPage.tsx (Phase 16) so its own row craft
// has exactly one implementation, shared with EntityDetailPage's scoped
// Investigations panel — "same row craft," literally the same component,
// not a lookalike built twice.
export function ThreadRow({
  thread,
  module,
  isSelected,
  onClick,
}: {
  thread: ThreadSummary;
  module: string | undefined;
  isSelected: boolean;
  onClick: () => void;
}) {
  const dot = statusDot(thread, module);
  return (
    <ListItem
      label={truncate(thread.title, 60)}
      description={formatTimestamp(thread.timestamp)}
      isSelected={isSelected}
      onClick={onClick}
      endContent={<StatusDot variant={dot.variant} label={dot.label} />}
    />
  );
}
