import { useMemo, useState, type SVGProps } from 'react';
import { SideNav, SideNavHeading, SideNavItem, SideNavSection, SideNavCollapseButton } from '@astryxdesign/core/SideNav';
import { type ReactNode } from 'react';
import {
  MagnifyingGlassIcon,
  BookmarkIcon,
  SignalIcon,
  FolderIcon,
  BriefcaseIcon,
  ShieldExclamationIcon,
  ServerStackIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePageStore, type Page } from '../../engine/stores/pageStore';
import { buildThreads, type ThreadSummary } from '../../engine/threads';
import { reopenThread } from '../../engine/openThread';
import { NotificationBell } from './NotificationBell';
import { ProfileMenu } from './ProfileMenu';
import { RecentSection } from './RecentSection';
import { BrandMark } from './BrandMark';
import { config } from '../../config';
import styles from './Sidebar.module.css';

const NAV_ITEMS: { page: Page; label: string; icon: ReactNode }[] = [
  // Phase 14: relabeled from "Entities" — same page/route (id stays
  // 'entities', only its nav label and PageShell title change), now
  // fronted by the asset-discovery grid rather than a plain list. Kept
  // as one nav entry rather than adding a second, separate "Discover"
  // page: it's the same content upgraded in place, and a second entry
  // pointing at overlapping content would be dead-nav-adjacent (no
  // ordering instruction was given for a split that doesn't exist).
  { page: 'entities', label: 'Discover', icon: <MagnifyingGlassIcon width={16} height={16} /> },
  //{ page: 'investigations', label: 'Investigations', icon: <FolderIcon width={16} height={16} /> },
  { page: 'watchlist', label: 'Watchlist', icon: <BookmarkIcon width={16} height={16} /> },
  // Holdings (Phase 15) sits right after Watchlist — groups the two
  // personal/session-tracked pages together, ahead of the market-wide
  // pages below (per the phase order's own nav-position ruling).
  { page: 'holdings', label: 'Holdings', icon: <WalletIcon width={16} height={16} /> },
  // Market Pulse (Phase 8I) sits between Data Sources and Investigations
  // deliberately — surfaced-but-unactioned observations read as a step
  // before the investigated record, not alongside the other index pages.
  { page: 'market-pulse', label: 'Market Pulse', icon: <SignalIcon width={16} height={16} /> },
  { page: 'portfolio-dashboard', label: 'Portfolio', icon: <BriefcaseIcon width={16} height={16} /> },
  { page: 'risk-dashboard', label: 'Risk', icon: <ShieldExclamationIcon width={16} height={16} /> },
  // Portfolio/Risk (Phase 13): pinned, always-available static dashboard
  // pages, appended after the existing index pages rather than
  // interleaved — no ordering instruction was given, flagged for review.

    { page: 'data-sources', label: 'Data Sources', icon: <ServerStackIcon width={16} height={16} /> },
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
// RecentSection (its own file) follows, then a two-section footer
// (collapse toggle above, avatar+notifications below — see the SideNav
// props below for why both live in `footer` now) pinned outside the
// scrollable area via Astryx's own SideNav footer mechanism so none of it
// can scroll out of view regardless of how much Recent content exists
// above.
//
// Investigation threading order: Recent is now the thread switcher, one
// row per investigation (buildThreads), not one row per turn. Selection
// and "New investigation" are both keyed directly off
// sessionStore.activeThreadId — see RecentSection's own comment for why
// this retires the earlier suppression-flag approach entirely rather
// than adding another special case to it.
export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(!config.sidebar.expanded);

  const turns = useSessionStore((state) => state.turns);
  const activeThreadId = useSessionStore((state) => state.activeThreadId);
  const setActiveThread = useSessionStore((state) => state.setActiveThread);
  const closeStack = useArtifactStore((state) => state.closeStack);
  const page = usePageStore((state) => state.page);
  const setPage = usePageStore((state) => state.setPage);

  const threads = useMemo(() => buildThreads(turns).slice(0, config.recent.count), [turns]);

  // Shows the blank composer landing, same as it did before turns/
  // artifacts existed — but no longer discards them (reported live:
  // clearing history read as real data loss). Clearing activeThreadId to
  // null is what actually shows LandingState (Frame.tsx); the next typed
  // query re-threads itself via addTurn's own lineage rule, which may
  // rejoin an existing investigation rather than starting a blank one —
  // deliberate, see sessionStore.ts's own comment. closeStack() matches:
  // a "fresh start" landing shouldn't sit beside a lingering open panel.
  function newInvestigation() {
    setActiveThread(null);
    closeStack();
    setPage('home');
  }

  // A Recent row is a link to the investigation, not just its artifact —
  // opening one must land back on Home; reopenThread (shared with
  // InvestigationsPage) handles which thread/artifact becomes current.
  function openThread(thread: ThreadSummary) {
    setPage('home');
    reopenThread(thread);
  }

  return (
    <SideNav
      // hasButton:false suppresses Astryx's own auto-injected collapse
      // button (which always renders paired with `footerIcons`, per its
      // source) — direct feedback wants the collapse control in its OWN
      // section, above the avatar+notification row, not paired with
      // either. SideNavCollapseButton supports exactly this: "Place
      // inside SideNav (reads context) or outside (pass handleRef)" —
      // placed manually inside `footer` below, reading context, no
      // handleRef needed since it's still inside this SideNav.
      collapsible={{ isCollapsed, onCollapsedChange: setIsCollapsed, hasButton: false }}
      header={<SideNavHeading icon={<BrandMark isCollapsed={isCollapsed} />} heading="Merlin" />}
      footer={
        <div className={styles.footerStack}>
          <div className={styles.collapseSection}>
            <SideNavCollapseButton />
          </div>
          <div className={isCollapsed ? styles.footerRowCollapsed : styles.footerRow}>
            <ProfileMenu isCollapsed={isCollapsed} onNewInvestigation={newInvestigation} />
            <NotificationBell />
          </div>
        </div>
      }
    >
      <SideNavSection title="Places" isHeaderHidden>
        <SideNavItem
          label="New investigation"
          icon={<PlusIcon width={16} height={16} />}
          onClick={newInvestigation}
          isSelected={page === 'home' && activeThreadId === null}
        />
        {NAV_ITEMS.map((item) => (
          <SideNavItem
            key={item.page}
            label={item.label}
            icon={item.icon}
            isSelected={page === item.page}
            onClick={() => setPage(item.page)}
          />
        ))}
      </SideNavSection>

      <RecentSection
        isCollapsed={isCollapsed}
        threads={threads}
        page={page}
        activeThreadId={activeThreadId}
        setPage={setPage}
        onOpenThread={openThread}
      />
    </SideNav>
    
  );
}
