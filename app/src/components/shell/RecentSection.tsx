import { SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';
import { StatusDot, type StatusDotVariant } from '@astryxdesign/core/StatusDot';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { Text } from '@astryxdesign/core/Text';
import { Icon } from '@astryxdesign/core/Icon';
import type { Turn } from '../../engine/stores/sessionStore';
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
  recent: Turn[];
  page: Page;
  openArtifactId: string | null;
  hasActiveThinkingTurn: boolean;
  setPage: (page: Page) => void;
  setOpenArtifact: (id: string) => void;
}

// Extracted from Sidebar.tsx to stay under the file budget once the
// collapsed/expanded split was added. The old always-visible search
// input is gone in BOTH states now — replaced by a single filter-icon
// trigger (endContent, expanded; the section's own icon, collapsed).
// Collapsed drops the inline list too, in favor of Astryx's own
// SideNavItem collapse behavior: a children-bearing item becomes an
// icon button that opens a popover containing those children in full
// expanded form — not custom-built, confirmed by reading SideNavItem's
// own source. "funnel" reads as filter/recent, distinct from
// Investigations' own "clock" icon.
export function RecentSection({
  isCollapsed,
  recent,
  page,
  openArtifactId,
  hasActiveThinkingTurn,
  setPage,
  setOpenArtifact,
}: RecentSectionProps) {
  // Shared between the expanded inline list and the collapsed popover's
  // contents — same row, same selection/click rules, two containers.
  function renderRecentRow(turn: Turn) {
    const artifactRef = turn.artifactRef;
    const isThinking = turn.status === 'resolved' && !artifactRef;
    const status: { variant: StatusDotVariant; label: string } =
      turn.status === 'unresolved'
        ? { variant: 'neutral', label: 'No match' }
        : turn.status === 'interrupted'
          ? { variant: 'neutral', label: 'Interrupted' }
          : artifactRef
            ? { variant: 'success', label: 'Answered' }
            : { variant: 'accent', label: 'Thinking…' };
    // Thinking is the current investigation, not a dead row: selected the
    // instant it's created, and a real, working control — clicking it
    // goes to Home to watch the live trail. An answered row's click is a
    // link to the investigation, not just its artifact — it must land
    // back on Home too, or clicking it elsewhere silently updates the
    // stack while leaving you stranded on the wrong page. Selection is
    // gated to page === 'home' and suppressed while anything is thinking
    // — the sidebar's own exactly-one-selected-item invariant. The
    // status dot stays unconditional; it's information, not nav state.
    return (
      <SideNavItem
        key={turn.id}
        label={truncate(turn.utterance, 36)}
        isSelected={
          page === 'home' && (isThinking || (!hasActiveThinkingTurn && !!artifactRef && artifactRef === openArtifactId))
        }
        isDisabled={turn.status === 'unresolved' || turn.status === 'interrupted'}
        endContent={<StatusDot variant={status.variant} label={status.label} isPulsing={isThinking} />}
        {...(artifactRef
          ? {
              onClick: () => {
                setPage('home');
                setOpenArtifact(artifactRef);
              },
            }
          : isThinking
            ? { onClick: () => setPage('home') }
            : {})}
      />
    );
  }

  // Muted, not full ink — "View all" is a utility link out of the list,
  // not a peer of the turns above it. SideNavItem accepts no className
  // (confirmed in its own source), so the override reaches its stable
  // astryx-side-nav-item class from this wrapper — see the module's own
  // comment for why display:contents keeps layout untouched.
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
        {recent.length === 0 ? emptyState : recent.map(renderRecentRow)}
        {viewAllItem}
      </SideNavItem>
    );
  }

  return (
    <SideNavSection
      title="Recent"
      endContent={
        <DropdownMenu
          button={{ label: 'Filter recent', icon: <Icon icon="funnel" size="sm" />, variant: 'ghost', isIconOnly: true }}
          hasChevron={false}
          items={FILTER_MENU_ITEMS}
        />
      }
    >
      {recent.length === 0 ? <div style={{ padding: '0 var(--space-16) var(--space-12)' }}>{emptyState}</div> : recent.map(renderRecentRow)}
      {viewAllItem}
    </SideNavSection>
  );
}
