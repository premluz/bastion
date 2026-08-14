import { useEffect, useState, type ReactNode } from 'react';
import { AppShell } from '@astryxdesign/core/AppShell';
import { Layout } from '@astryxdesign/core/Layout';
import { type Theme } from '../ThemeSwitch/ThemeSwitch';
import { LandingState } from './LandingState';
import { WorkbenchTitleBar } from './WorkbenchTitleBar';
import { TranscriptAndComposer } from './TranscriptAndComposer';
import { TranscriptPaneMount } from './TranscriptPaneMount';
import { ArtifactStackMount } from './ArtifactStackMount';
import { CollapsedPaneChip } from './CollapsedPaneChip';
import { DesktopOnlyNotice } from './DesktopOnlyNotice';
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
import { usePageStore, connectPageHistory, type Page } from '../../engine/stores/pageStore';
import { connectLiveChannel } from '../../engine/liveChannel';
import { useViewportWidth } from './useViewportWidth';
import { usePaneVisibility } from './usePaneVisibility';
import { useSpecularPointer } from './useSpecularPointer';
import layout from './Frame.module.css';

// Phase 18, tier 3's fence: below this, the whole app shell gives way to
// DesktopOnlyNotice — nothing multi-pane mounts underneath.
const DESKTOP_MIN_WIDTH = 768;

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
  const [theme] = useState<Theme>(initialTheme);
  const activeThreadId = useSessionStore((state) => state.activeThreadId);
  const artifactCount = useArtifactStore((state) => Object.keys(state.artifacts).length);
  const isStackOpen = useArtifactStore((state) => state.isStackOpen);
  const isMaximized = useArtifactStore((state) => state.isMaximized);
  const page = usePageStore((state) => state.page);
  const viewportWidth = useViewportWidth();

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
  const { rowRef, showTranscript, showArtifact, collapsedPane } = usePaneVisibility({
    naturalShowTranscript,
    naturalShowStack,
  });

  // Tier 3 (Phase 18): below this width, nothing multi-pane mounts at
  // all — checked after every hook above has already run (Rules of
  // Hooks), not before. viewportWidth starts >0 in any real browser
  // (useViewportWidth's own initial state reads window.innerWidth
  // synchronously), so there's no first-paint flash to guard against.
  if (viewportWidth > 0 && viewportWidth < DESKTOP_MIN_WIDTH) {
    return <DesktopOnlyNotice />;
  }

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
              <div
                className={layout.row}
                ref={rowRef}
                // Lets PageShell's own outer padding (its right side only)
                // fall back to 0 when a side pane sits next to it — the
                // row's own gap (below) already separates them at that
                // point, so PageShell's page-margin padding would only
                // double up with it. 1/0 rather than a boolean so the CSS
                // side can consume it directly in a calc() (see
                // PageShell.module.css's own comment on this variable).
                style={{ '--content-has-sibling-pane': showArtifact || showTranscript ? 1 : 0 } as React.CSSProperties}
              >
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
                    hasStarted ? <TranscriptAndComposer /> : <LandingState />
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
                <ArtifactStackMount show={showArtifact} />
                {collapsedPane === 'artifact' && <CollapsedPaneChip pane="artifact" />}
                {/* Chat pane on the right (2026-07-30): moved from leftmost
                    position to trailing edge, rendering last in the row.
                    Hidden on Home (which already shows the transcript as its
                    own content column below) and while maximized. Phase 18:
                    `showTranscript` already folds in the collapse trigger —
                    collapsed reuses this mount's own slide-out. */}
                <TranscriptPaneMount show={showTranscript} />
                {collapsedPane === 'transcript' && <CollapsedPaneChip pane="transcript" />}
              </div>
            </div>
          }
        />
      </AppShell>
    </div>
  );
}
