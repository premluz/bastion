import { useMemo, useState, type SVGProps } from 'react';
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePageStore, type Page } from '../../engine/stores/pageStore';
import { NotificationBell } from './NotificationBell';
import { ProfileMenu } from './ProfileMenu';
import { RecentSection } from './RecentSection';
import { config } from '../../config';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { page: Page; label: string; icon: 'clock' | 'search' | 'checkDouble' | 'externalLink' | 'info' }[] = [
  { page: 'entities', label: 'Entities', icon: 'search' },
  { page: 'watchlist', label: 'Watchlist', icon: 'checkDouble' },
  { page: 'data-sources', label: 'Data Sources', icon: 'externalLink' },
  // Market Pulse (Phase 8I) sits between Data Sources and Investigations
  // deliberately — surfaced-but-unactioned observations read as a step
  // before the investigated record, not alongside the other index pages.
  // No "pulse/activity" icon exists in Astryx's closed set (exhibit 10);
  // `info` is the closest fit — ambient, surfaced-for-awareness content.
  { page: 'market-pulse', label: 'Market Pulse', icon: 'info' },
  { page: 'investigations', label: 'Investigations', icon: 'clock' },
];

// No "add/new/plus" icon exists in Astryx's closed set (exhibit 11 —
// joins exhibit 8's missing bell, exhibit 9's missing diagonal-expand,
// exhibit 10's missing pulse/activity glyph). A collapsed "New
// investigation" is otherwise unreachable at all: SideNavItem hides
// itself in collapsed mode when given no icon (its own source, not
// guessed), which is why the control was invisible whenever the rail
// was collapsed. Built as a real IconType component (not a raw inline
// SVG) so it flows through Icon's own size/color plumbing exactly like
// every registered icon, matching Astryx's own default-icon convention
// (defaultIcons.tsx: 24x24 viewBox, currentColor, 1.5 stroke, round caps).
function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// Primary app navigation (Phase 8H — supersedes Phase 8C's turn-history
// sidebar; Phase 8I adds Market Pulse). Names PLACES, not turns: New
// investigation is the first item in the same list as the five pages —
// not a separate topContent slot, which read as a disconnected control
// floating above a gap rather than a peer of Entities/Watchlist/etc.
// RecentSection (its own file) follows, then footerIcons (profile,
// notifications) pinned outside the scrollable area via Astryx's own
// SideNav footer mechanism so neither can scroll out of view regardless
// of how much Recent content exists above — the earlier hand-rolled
// marginTop:auto block lived INSIDE the scrollable children, so it could
// and did scroll away once Recent had enough rows; reported live, fixed
// by using the primitive Astryx actually built for this. Module-grouped/
// flat turn browsing itself lives entirely in InvestigationsPage — this
// component never renders turn groups.
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(!config.sidebar.expanded);

  const turns = useSessionStore((state) => state.turns);
  const setOpenArtifact = useArtifactStore((state) => state.setOpenArtifact);
  const openArtifactId = useArtifactStore((state) => state.openArtifactId);
  const page = usePageStore((state) => state.page);
  const setPage = usePageStore((state) => state.setPage);

  // A turn belongs in Recent the moment it exists — waiting for
  // artifactRef meant a new investigation was invisible here for its
  // entire trail-playing duration, which read as "nothing happened."
  // Found live, reported directly: Recent must show the row as soon as
  // the agent starts processing, not once it finishes. No search/filter
  // narrows this list anymore (the old text input was removed — see
  // RecentSection's filter menu, which is unrelated to this list).
  const recent = useMemo(() => [...turns].reverse().slice(0, config.recent.count), [turns]);

  // At most one turn is ever "resolved, no artifactRef" at a time
  // (sessionStore.addTurn's own interrupted-turn invariant). While one
  // exists, it's the ONLY thing "current": openArtifactId still points at
  // the PREVIOUS turn's artifact until this one's own trail settles and
  // autoOpen claims it — selecting by openArtifactId here would let a
  // new investigation's thinking row and the old open row both read
  // selected at once (reported live, the sidebar's single-selection
  // invariant broken during exactly this handoff window).
  const hasActiveThinkingTurn = useMemo(() => turns.some((turn) => turn.status === 'resolved' && !turn.artifactRef), [turns]);

  // No longer clears turns/artifacts — reported live: it destroyed the
  // whole investigation history, which read as data loss, not "starting
  // fresh." There's no per-thread model in this app (every turn lives in
  // one flat, always-visible list), so "new investigation" is just a
  // shortcut back to Home to ask the next question; the existing
  // transcript stays exactly where it was, same as any other navigation.
  function newInvestigation() {
    setPage('home');
  }

  return (
    <SideNav
      collapsible={{ isCollapsed, onCollapsedChange: setIsCollapsed }}
      header={<SideNavHeading heading="Merlin" />}
      footerIcons={
        <div className={isCollapsed ? styles.footerRowCollapsed : styles.footerRow}>
          <ProfileMenu isCollapsed={isCollapsed} onNewInvestigation={newInvestigation} />
          <NotificationBell />
        </div>
      }
    >
      <SideNavSection title="Places" isHeaderHidden>
        <SideNavItem
          label="New investigation"
          icon={<Icon icon={PlusIcon} size="sm" />}
          onClick={newInvestigation}
          isSelected={page === 'home' && turns.length === 0}
        />
        {NAV_ITEMS.map((item) => (
          <SideNavItem
            key={item.page}
            label={item.label}
            icon={<Icon icon={item.icon} size="sm" />}
            isSelected={page === item.page}
            onClick={() => setPage(item.page)}
          />
        ))}
      </SideNavSection>
      <Divider />

      <RecentSection
        isCollapsed={isCollapsed}
        recent={recent}
        page={page}
        openArtifactId={openArtifactId}
        hasActiveThinkingTurn={hasActiveThinkingTurn}
        setPage={setPage}
        setOpenArtifact={setOpenArtifact}
      />
    </SideNav>
  );
}
