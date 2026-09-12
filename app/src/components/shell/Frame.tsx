import { useEffect, useState, type ReactNode } from 'react';
import { AppShell } from '@astryxdesign/core/AppShell';
import { Layout } from '@astryxdesign/core/Layout';
import { useMediaQuery } from '@astryxdesign/core/hooks';
import { type Theme } from '../ThemeSwitch/ThemeSwitch';
import { WorkbenchTitleBar } from './WorkbenchTitleBar';
import { WorkbenchRow } from './WorkbenchRow';
import { MobileTopNav } from './MobileTopNav';
import { InvestigationsPage } from './InvestigationsPage';
import { EntitiesPage } from './EntitiesPage';
import { WatchlistPage } from './WatchlistPage';
import { HoldingsPage } from './HoldingsPage';
import { DataSourcesPage } from './DataSourcesPage';
import { MarketPulsePage } from './MarketPulsePage';
import { EntityDetailPage } from './EntityDetailPage';
import { Sidebar } from './Sidebar';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePageStore, connectPageHistory, type Page } from '../../engine/stores/pageStore';
import { connectLiveChannel } from '../../engine/liveChannel';
import { usePaneVisibility } from './usePaneVisibility';
import { useSpecularPointer } from './useSpecularPointer';
import layout from './Frame.module.css';

// Mobile breakpoint (Phase 20, direct order overriding Phase 18 item 1's
// own closed "<768px permanently out of scope" decision — see CLAUDE.md's
// own Phase 20 entry for the full citation). Matches AppShell's own
// default `mobileNav.breakpoint: 'md'` (BREAKPOINT_VALUES.md === 768,
// read directly from AppShell.js rather than guessed) — useMediaQuery is
// the SAME hook AppShell uses internally for this exact check, reused
// rather than a second hand-rolled viewportWidth listener. See
// MobileTopNav.tsx's own comment for why this file gates the mobile
// topNav composition itself, rather than leaving AppShell to do it.
const MOBILE_BREAKPOINT_QUERY = '(max-width: 768px)';

// Landing surface is the question, never a workspace (node-vocabulary.md
// Shell law) — LandingState (centered greeting + composer + suggestion
// cards) shows before the first turn; once a turn exists, Home switches
// to the transcript + bottom-docked composer layout, now inside
// WorkbenchRow.tsx (extracted the same round MobilePaneModals/
// MobileTopNav were, once mobile modal support pushed this file back
// over the 200-line budget).

function renderPage(page: Page): ReactNode {
  switch (page) {
    case 'investigations':
      return <InvestigationsPage />;
    case 'entities':
      return <EntitiesPage />;
    case 'watchlist':
      return <WatchlistPage />;
    case 'holdings':
      return <HoldingsPage />;
    case 'data-sources':
      return <DataSourcesPage />;
    case 'market-pulse':
      return <MarketPulsePage />;
    case 'entity-detail':
      return <EntityDetailPage />;
    case 'home':
      return null;
  }
}

export function Frame({ initialTheme = 'default' }: { initialTheme?: Theme }) {
  const [theme] = useState<Theme>(initialTheme);
  const activeThreadId = useSessionStore((state) => state.activeThreadId);
  const artifactCount = useArtifactStore((state) => Object.keys(state.artifacts).length);
  const isStackOpen = useArtifactStore((state) => state.isStackOpen);
  const isMaximized = useArtifactStore((state) => state.isMaximized);
  const closeStack = useArtifactStore((state) => state.closeStack);
  const toggleChatPane = useArtifactStore((state) => state.toggleChatPane);
  const page = usePageStore((state) => state.page);
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT_QUERY);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Pointer-tracked specular for glass surfaces. Deliberately unconditional
  // on theme: the hook only writes coordinates, and every matte theme sets
  // --spec-alpha: 0, so nothing renders there. Gating it on theme here would
  // put a visual decision in application code — exactly what the token
  // cascade exists to prevent.
  useSpecularPointer();

  // Phase 9: subscribed for the app's whole lifetime, not just once a turn
  // exists — a push_scene while still on LandingState must still land (it
  // creates the first turn itself via presentScene, which is what flips
  // hasStarted).
  useEffect(() => connectLiveChannel(), []);

  // Browser back/forward: pageStore already writes location.hash on every
  // navigation (a history entry per page change); this is the one missing
  // piece — reacting to popstate to sync page state back from the URL.
  // See connectPageHistory's own comment for why it doesn't also restore
  // selectedEntityId.
  useEffect(() => connectPageHistory(), []);

  // Investigation threading order: activeThreadId is the single signal
  // for "show the transcript vs. the blank landing composer," replacing
  // the earlier isLandingOverride flag — null means no thread is active
  // ("New investigation" clears it), any other value means that thread's
  // turns should render. Set by submitQuery.ts/presentScene.ts when a
  // turn starts and by artifactStore.setOpenArtifact when an artifact is
  // deliberately reopened — never left for this component to manage.
  const hasStarted = activeThreadId !== null;
  const showStack = isStackOpen && artifactCount > 0;
  const isMaximizedStack = showStack && isMaximized;

  // Phase 18: "natural" = what each pane wants, ignoring the collapse
  // trigger — computed here since both depend on this component's own
  // page/hasStarted/isMaximizedStack locals. Everything downstream
  // (activity-touching, the fit-collapse observer, the final show/collapse
  // booleans) lives in usePaneVisibility, extracted to keep this file under
  // budget.
  const isChatForcedOpen = useArtifactStore((state) => state.isChatForcedOpen);
  const isChatManuallyClosed = useArtifactStore((state) => state.isChatManuallyClosed);
  const naturalShowTranscript = page !== 'home' && (hasStarted || isChatForcedOpen) && !isChatManuallyClosed && !isMaximizedStack;
  const naturalShowStack = showStack;
  const { rowRef, showTranscript, showArtifact, collapsedPanes } = usePaneVisibility({
    naturalShowTranscript,
    naturalShowStack,
  });

  return (
    <div className={layout.viewport}>
      {/* Phase 8C: AppShell is the outermost frame per its own docs ("Don't
          nest one AppShell inside another; it's the outermost layout
          frame") — the existing Layout (header+content) moves inside it
          unchanged. "Merlin" branding moved from this header into
          Sidebar's SideNavHeading, per Astryx's own guidance against
          duplicating branding between a TopNav-equivalent and a
          SideNavHeading. */}
      <AppShell
        height="fill"
        contentPadding={0}
        sideNav={<Sidebar />}
        {...(isMobile
          ? {
              topNav: <MobileTopNav />,
            }
          : {})}
      >
        <Layout /*
          header={
            <LayoutHeader hasDivider>
              <div className={layout.topBarActions}>
                <ThemeSwitch theme={theme} onThemeChange={setTheme} />
              </div>
            </LayoutHeader>
          } */
          content={
            <div className={layout.paneColumn}>
              {/* Top bar runs the full row width (architect order,
                  generalized 2026-07-29 past Home to every page) — a
                  sibling of the row below, not nested inside its narrower
                  content column, so it spans over the artifact stack too.
                  Hidden alongside content when maximized: the whole
                  viewport becomes just the stack at that point, no room
                  or reason for a title bar above it. Home still waits for
                  hasStarted (LandingState has no title bar, unchanged);
                  every other page shows its bar unconditionally. */}
              {!isMaximizedStack && (page !== 'home' || hasStarted) && <WorkbenchTitleBar page={page} />}
              <WorkbenchRow
                rowRef={rowRef}
                page={page}
                hasStarted={hasStarted}
                isMaximizedStack={isMaximizedStack}
                isMobile={isMobile}
                showTranscript={showTranscript}
                showArtifact={showArtifact}
                collapsedPanes={collapsedPanes}
                closeStack={closeStack}
                toggleChatPane={toggleChatPane}
                renderPage={renderPage}
              />
            </div>
          }
        />
      </AppShell>
    </div>
  );
}
