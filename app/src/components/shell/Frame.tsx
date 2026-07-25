import { useEffect, useState, type ReactNode } from 'react';
import { AppShell } from '@astryxdesign/core/AppShell';
import { Layout, LayoutHeader } from '@astryxdesign/core/Layout';
import { ThemeSwitch, type Theme } from '../ThemeSwitch/ThemeSwitch';
import { ChatBar } from './ChatBar';
import { Transcript } from './Transcript';
import { LandingState } from './LandingState';
import { ScrollAnchor } from './ScrollAnchor';
import { HomeTopBar } from './HomeTopBar';
import { ArtifactStackMount } from './ArtifactStackMount';
import { InvestigationsPage } from './InvestigationsPage';
import { EntitiesPage } from './EntitiesPage';
import { WatchlistPage } from './WatchlistPage';
import { DataSourcesPage } from './DataSourcesPage';
import { MarketPulsePage } from './MarketPulsePage';
import { PortfolioDashboardPage } from './PortfolioDashboardPage';
import { RiskDashboardPage } from './RiskDashboardPage';
import { EntityDetailPage } from './EntityDetailPage';
import { Sidebar } from './Sidebar';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePageStore, type Page } from '../../engine/stores/pageStore';
import { connectLiveChannel } from '../../engine/liveChannel';
import viewport from './ChatViewport.module.css';
import layout from './Frame.module.css';
import pane from './PanePadding.module.css';

// Landing surface is the question, never a workspace (node-vocabulary.md
// Shell law) — LandingState (centered greeting + composer + suggestion
// cards) shows before the first turn; once a turn exists, Home switches
// to the transcript + bottom-docked composer layout below. ScrollAnchor
// and HomeTopBar extracted to their own files (this file was over the
// 200-line budget) during the panel-layout restructure order below.

function renderPage(page: Page): ReactNode {
  switch (page) {
    case 'investigations':
      return <InvestigationsPage />;
    case 'entities':
      return <EntitiesPage />;
    case 'watchlist':
      return <WatchlistPage />;
    case 'data-sources':
      return <DataSourcesPage />;
    case 'market-pulse':
      return <MarketPulsePage />;
    case 'portfolio-dashboard':
      return <PortfolioDashboardPage />;
    case 'risk-dashboard':
      return <RiskDashboardPage />;
    case 'entity-detail':
      return <EntityDetailPage />;
    case 'home':
      return null;
  }
}

export function Frame({ initialTheme = 'default' }: { initialTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const activeThreadId = useSessionStore((state) => state.activeThreadId);
  const artifactCount = useArtifactStore((state) => Object.keys(state.artifacts).length);
  const isStackOpen = useArtifactStore((state) => state.isStackOpen);
  const isMaximized = useArtifactStore((state) => state.isMaximized);
  const page = usePageStore((state) => state.page);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Phase 9: subscribed for the app's whole lifetime, not just once a turn
  // exists — a push_scene while still on LandingState must still land (it
  // creates the first turn itself via presentScene, which is what flips
  // hasStarted).
  useEffect(() => connectLiveChannel(), []);

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

  return (
    <div style={{ height: '100dvh' }}>
      {/* Phase 8C: AppShell is the outermost frame per its own docs ("Don't
          nest one AppShell inside another; it's the outermost layout
          frame") — the existing Layout (header+content) moves inside it
          unchanged. "Merlin" branding moved from this header into
          Sidebar's SideNavHeading, per Astryx's own guidance against
          duplicating branding between a TopNav-equivalent and a
          SideNavHeading. */}
      <AppShell height="fill" contentPadding={0} sideNav={<Sidebar />}>
        <Layout /*
          header={
            <LayoutHeader hasDivider>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <ThemeSwitch theme={theme} onThemeChange={setTheme} />
              </div>
            </LayoutHeader>
          } */
          content={
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
              {/* Top bar runs the full row width (architect order) — a
                  sibling of the row below, not nested inside its narrower
                  content column, so it spans over the artifact stack too.
                  Hidden alongside content when maximized: the whole
                  viewport becomes just the stack at that point, no room
                  or reason for the investigation-title bar above it. */}
              {page === 'home' && hasStarted && !isMaximizedStack && <HomeTopBar />}
              <div className={layout.row}>
                {/* Maximize (Phase 8H): the stack takes the full row
                    width and this column hides — display:none, not
                    unmounted, so an in-progress composer draft survives a
                    maximize/restore round trip. Best-practice "maximize a
                    panel" pattern (VS Code, most IDE-style workbenches):
                    one pane goes full-width, its sibling steps aside
                    entirely rather than sharing a now-meaningless split. */}
                <div
                  className={layout.contentColumn}
                  style={{ display: isMaximizedStack ? 'none' : 'flex' }}
                >
                  {page === 'home' ? (
                    hasStarted ? (
                      <>
                        <ScrollAnchor>
                          <Transcript />
                        </ScrollAnchor>
                        <div className={pane.padded} style={{ flexShrink: 0 }}>
                          <div className={viewport.viewport}>
                            <ChatBar />
                          </div>
                        </div>
                      </>
                    ) : (
                      <LandingState />
                    )
                  ) : (
                    renderPage(page)
                  )}
                </div>
                {/* Right side: Artifacts is the ONLY pane, global across
                    every page per the routing law ("pages never host
                    scene renders") — investigating an entity from a page
                    still lands its result here without leaving that
                    page. Slides in/out (ArtifactStackMount), not a plain
                    mount toggle — see its own file for why. */}
                <ArtifactStackMount show={showStack} />
              </div>
            </div>
          }
        />
      </AppShell>
    </div>
  );
}
