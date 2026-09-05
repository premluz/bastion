import { SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';
import { StatusDot, type StatusDotVariant } from '@astryxdesign/core/StatusDot';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import type { ThreadSummary } from '../../engine/threads';
import type { Page } from '../../engine/stores/pageStore';
import styles from './RecentSection.module.css';

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Filter/group menu, header endContent — architect-specified label set,
// explicitly inert for this pass ("these options would do nothing"), a
// deliberate exception to the honest-controls principle logged rather
// than silently applied: only "Status" maps to a real field on Turn
// today (resolved/unresolved/interrupted, already surfaced as the
// StatusDot below); Type/Class/Activity/Group by have no corresponding
// data yet. Unrelated to the recent list itself, which stays inline and
// unfiltered — confirmed directly: "you see the recent turns all the
// time on expanded... they have nothing to do with the filter icon."
const FILTER_MENU_ITEMS = [{ label: 'Type' }, { label: 'Status' }, { label: 'Class' }, { label: 'Activity' }, { label: 'Group by' }];

interface RecentSectionProps {
  isCollapsed: boolean;
  threads: ThreadSummary[];
  page: Page;
  activeThreadId: string | null;
  setPage: (page: Page) => void;
  onOpenThread: (thread: ThreadSummary) => void;
}

// Extracted from Sidebar.tsx to stay under the file budget. Investigation
// threading order: each row is now one THREAD (buildThreads groups the
// flat turns array), not one turn — a base query and its refine, or an
// entity-link that rejoined an earlier investigation, all collapse into
// a single row. Selection is now a plain equality check against
// activeThreadId, the single source of truth for "which investigation is
// showing" — the old isThinking/openArtifactId OR-condition (and its
// hasActiveThinkingTurn/isLandingOverride suppression hacks, needed to
// stop it from reading two things selected at once) is gone: exactly one
// thread can ever equal activeThreadId, so the sidebar's single-
// selection invariant now holds by construction, not by patching each
// new edge case as it was found live.
//
// The old always-visible search input is gone in BOTH states — replaced
// by a single filter-icon trigger (endContent, expanded; the section's
// own icon, collapsed). Collapsed drops the inline list too, in favor of
// Astryx's own SideNavItem collapse behavior: a children-bearing item
// becomes an icon button that opens a popover containing those children
// in full expanded form — not custom-built, confirmed by reading
// SideNavItem's own source. "funnel" reads as filter/recent, distinct
// from Investigations' own "clock" icon.
export function RecentSection({ isCollapsed, threads, page, activeThreadId, setPage, onOpenThread }: RecentSectionProps) {
  // Shared between the expanded inline list and the collapsed popover's
  // contents — same row, same rules, two containers.
  function renderThreadRow(thread: ThreadSummary) {
    const { latestTurn } = thread;
    const artifactRef = latestTurn.artifactRef;
    // Settled means EITHER slot is populated (Phase 21) — an inline-mounted
    // turn has no artifactRef but is just as done as an artifact-mounted
    // one; reading artifactRef alone as "is this settled" would show a
    // permanently-stuck "Thinking…" for every inline result.
    const isSettled = !!artifactRef || !!latestTurn.inlineScene;
    const isThinking = latestTurn.status === 'resolved' && !isSettled;
    const status: { variant: StatusDotVariant; label: string } =
      latestTurn.status === 'unresolved'
        ? { variant: 'neutral', label: 'No match' }
        : latestTurn.status === 'interrupted'
          ? { variant: 'neutral', label: 'Interrupted' }
          : isSettled
            ? { variant: 'success', label: 'Answered' }
            : { variant: 'accent', label: 'Thinking…' };
    // Every thread is a real, viewable transcript now (even one whose
    // only turn is unresolved or interrupted) — clicking always lands on
    // Home showing it, never disabled. The status dot stays unconditional;
    // it's information, not navigation state.
    return (
      <SideNavItem
        key={thread.threadId}
        label={truncate(thread.title, 36)}
        isSelected={page === 'home' && activeThreadId === thread.threadId}
        endContent={<StatusDot variant={status.variant} label={status.label} isPulsing={isThinking} />}
        onClick={() => onOpenThread(thread)}
      />
    );
  }

  const viewAllItem = (
    <div key="view-all" className={styles.viewAllMuted}>
      <SideNavItem label="View all" onClick={() => setPage('investigations')} isSelected={false} />
    </div>
  );
  const emptyState = (
    <Text type="supporting" color="secondary">
      Nothing yet.
    </Text>
  );

  if (isCollapsed) {
    return (
      <SideNavItem label="Recent" icon={<Icon icon="funnel" size="sm" />}>
        {threads.length === 0 ? emptyState : threads.map(renderThreadRow)}
        {viewAllItem}
      </SideNavItem>
    );
  }

  return (
    <SideNavSection
      title="Recent"
      endContent={
        <div className={styles.filterTrigger}>
          <DropdownMenu
            button={{ label: 'Filter recent', icon: <Icon icon="funnel" size="sm" />, variant: 'ghost', isIconOnly: true }}
            hasChevron={false}
            items={FILTER_MENU_ITEMS}
          />
        </div>
      }
    >
      {threads.length === 0 ? <div style={{ padding: '0 var(--space-16) var(--space-12)' }}>{emptyState}</div> : threads.map(renderThreadRow)}
      {viewAllItem}
    </SideNavSection>
  );
}
