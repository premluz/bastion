import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppShell } from '@astryxdesign/core/AppShell';
import { Layout, LayoutHeader } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { ThemeSwitch, type Theme } from '../ThemeSwitch/ThemeSwitch';
import { ChatBar } from './ChatBar';
import { Transcript } from './Transcript';
import { LandingState } from './LandingState';
import { ArtifactStack } from './ArtifactStack';
import { ArtifactStackControl } from './ArtifactStackControl';
import { InvestigationsPage } from './InvestigationsPage';
import { EntitiesPage } from './EntitiesPage';
import { WatchlistPage } from './WatchlistPage';
import { DataSourcesPage } from './DataSourcesPage';
import { MarketPulsePage } from './MarketPulsePage';
import { Sidebar } from './Sidebar';
import { useSceneStore } from '../../engine/stores/sceneStore';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { useTrailStore } from '../../engine/stores/trailStore';
import { usePageStore, type Page } from '../../engine/stores/pageStore';
import { connectLiveChannel } from '../../engine/liveChannel';

// Landing surface is the question, never a workspace (node-vocabulary.md
// Shell law) — LandingState (centered greeting + composer + suggestion
// cards) shows before the first turn; once a turn exists, Home switches
// to the transcript + bottom-docked composer layout below.
//
// Astryx's ChatLayout was tried first (rule 5) — it's the real primitive
// for "composer fixed bottom, content auto-scrolls" — but its auto-scroll
// assumes a message-array model and didn't anchor correctly against our
// static, conditionally-empty children (verified via DOM inspection, not
// guessed: content was reproducibly rendered above the visible viewport,
// its own "scroll to bottom" affordance didn't correct it). ChatComposer
// (the actual input widget) works exactly as documented and is kept.
// The anchor-to-bottom behavior below is a plain, fully-understood flex +
// scrollTop effect — small enough to own outright rather than fight an
// opaque internal we can't verify further without Astryx's own source.
//
// Bug fixed: pinning short content to the bottom via `justify-content:
// flex-end` on the scrolling container is a known flexbox+overflow trap —
// once content overflows, the start of it becomes unreachable by
// scrolling (scrollHeight is correct, but the browser clamps scrollTop
// short of showing it). `margin-top: auto` on the content child achieves
// the same "pin short content to the bottom" result without that trap.
function ScrollAnchor({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const activeScene = useSceneStore((state) => state.activeScene);
  const sessionEntryCount = useSessionStore((state) => state.turns.length);
  const trailActiveIndex = useTrailStore((state) => state.activeIndex);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeScene, sessionEntryCount, trailActiveIndex]);

  return (
    <div
      ref={ref}
      style={{
        flex: '1 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'grid', gap: 'var(--space-24)', padding: 'var(--space-24)', marginTop: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

// Home's own top bar (Phase 8H) — current artifact's title on the left
// (the most recent turn's title before anything is open), the artifact
// stack control on the right. Distinct from the persistent AppShell
// header below, which only ever holds ThemeSwitch.
function HomeTopBar() {
  const openArtifactId = useArtifactStore((state) => state.openArtifactId);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const turns = useSessionStore((state) => state.turns);
  const activeTitle =
    (openArtifactId && artifacts[openArtifactId]?.scene.title) ?? turns[turns.length - 1]?.utterance ?? 'New investigation';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-12) var(--space-16)',
        borderBottom: '1px solid var(--edge)',
        flexShrink: 0,
      }}
    >
      <Text type="label" weight="semibold">
        {activeTitle}
      </Text>
      <ArtifactStackControl />
    </div>
  );
}

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
    case 'home':
      return null;
  }
}

export function Frame({ initialTheme = 'default' }: { initialTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const turnCount = useSessionStore((state) => state.turns.length);
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

  const hasStarted = turnCount > 0;
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
        <Layout
          header={
            <LayoutHeader hasDivider>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <ThemeSwitch theme={theme} onThemeChange={setTheme} />
              </div>
            </LayoutHeader>
          }
          content={
            <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
              {/* Maximize (Phase 8H): the stack takes the full content
                  width and this column hides — display:none, not
                  unmounted, so an in-progress composer draft survives a
                  maximize/restore round trip. Best-practice "maximize a
                  panel" pattern (VS Code, most IDE-style workbenches):
                  one pane goes full-width, its sibling steps aside
                  entirely rather than sharing a now-meaningless split. */}
              <div
                style={{
                  display: isMaximizedStack ? 'none' : 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                  minWidth: 0,
                  height: '100%',
                }}
              >
                {page === 'home' ? (
                  hasStarted ? (
                    <>
                      <HomeTopBar />
                      <ScrollAnchor>
                        <Transcript />
                      </ScrollAnchor>
                      <div style={{ flexShrink: 0, padding: 'var(--space-16)' }}>
                        <ChatBar />
                      </div>
                    </>
                  ) : (
                    <LandingState />
                  )
                ) : (
                  renderPage(page)
                )}
              </div>
              {/* Right side: Artifacts is the ONLY pane, global across every
                  page per the routing law ("pages never host scene
                  renders") — investigating an entity from a page still
                  lands its result here without leaving that page. */}
              {showStack && <ArtifactStack />}
            </div>
          }
        />
      </AppShell>
    </div>
  );
}
