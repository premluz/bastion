import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppShell } from '@astryxdesign/core/AppShell';
import { Layout, LayoutHeader } from '@astryxdesign/core/Layout';
import { ThemeSwitch, type Theme } from '../ThemeSwitch/ThemeSwitch';
import { ChatBar } from './ChatBar';
import { Transcript } from './Transcript';
import { LandingState } from './LandingState';
import { ArtifactPanel } from './ArtifactPanel';
import { EntitiesPane } from './EntitiesPane';
import { SourcesPane } from './SourcesPane';
import { WatchlistPane } from './WatchlistPane';
import { HistoryPane } from './HistoryPane';
import { PaneResizeHandle } from './PaneResizeHandle';
import { WorkbenchRail } from './WorkbenchRail';
import { PANE_META } from './paneMeta';
import { Sidebar } from './Sidebar';
import { useSceneStore } from '../../engine/stores/sceneStore';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { useTrailStore } from '../../engine/stores/trailStore';
import { useWorkbenchStore, type PaneKind } from '../../engine/stores/workbenchStore';
import { connectLiveChannel } from '../../engine/liveChannel';

// One entry per registered pane kind (Phase 8G WO-2) — the only place
// that maps a kind to its content component, so adding a future pane is
// a one-line addition here plus a config.ts/paneMeta.ts entry, not a
// change to the render loop below.
function renderPaneContent(kind: PaneKind, width: number): ReactNode {
  switch (kind) {
    case 'artifact':
      return <ArtifactPanel width={width} />;
    case 'entities':
      return <EntitiesPane width={width} />;
    case 'sources':
      return <SourcesPane width={width} />;
    case 'watchlist':
      return <WatchlistPane width={width} />;
    case 'history':
      return <HistoryPane width={width} />;
  }
}

// Landing surface is the question, never a workspace (node-vocabulary.md
// Shell law) — LandingState (centered greeting + composer + suggestion
// cards) shows before the first turn; once a turn exists, the shell
// switches to the transcript + bottom-docked composer layout below.
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

export function Frame({ initialTheme = 'default' }: { initialTheme?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const turnCount = useSessionStore((state) => state.turns.length);
  const openArtifactId = useArtifactStore((state) => state.openArtifactId);
  const panes = useWorkbenchStore((state) => state.panes);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Phase 9: subscribed for the app's whole lifetime, not just once a turn
  // exists — a push_scene while still on LandingState must still land (it
  // creates the first turn itself via presentScene, which is what flips
  // hasStarted).
  useEffect(() => connectLiveChannel(), []);

  const hasStarted = turnCount > 0;

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
            hasStarted ? (
              <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minWidth: 0, height: '100%' }}>
                  <ScrollAnchor>
                    <Transcript />
                  </ScrollAnchor>
                  <div style={{ flexShrink: 0, padding: 'var(--space-16)' }}>
                    <ChatBar />
                  </div>
                </div>
                {panes
                  .filter((pane) => pane.open && (pane.kind !== 'artifact' || openArtifactId))
                  .map((pane) => (
                    <PaneResizeHandle key={pane.kind} paneKind={pane.kind} label={`Resize ${PANE_META[pane.kind].label}`}>
                      {(width) => renderPaneContent(pane.kind, width)}
                    </PaneResizeHandle>
                  ))}
                <WorkbenchRail />
              </div>
            ) : (
              <LandingState />
            )
          }
        />
      </AppShell>
    </div>
  );
}
