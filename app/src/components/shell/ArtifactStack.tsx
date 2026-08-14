import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { List, ListItem } from '@astryxdesign/core/List';
import { Token } from '@astryxdesign/core/Token';
import { useResizable } from '@astryxdesign/core/Resizable';
import { useArtifactStore, type Artifact } from '../../engine/stores/artifactStore';
import { useSessionStore, type Turn } from '../../engine/stores/sessionStore';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { sceneFamily } from '../../engine/sceneFamily';
import { PANE_FLOOR } from './paneFloors';
import { StatusTag } from '../nodes/StatusTag';
import { Canvas } from './Canvas';
import { PaneTitleBar } from './PaneTitleBar';
import pane from './PanePadding.module.css';
import styles from './ArtifactStack.module.css';

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

interface StackRow {
  artifactId: string;
  artifact: Artifact;
  turn: Turn;
  version: number;
}

function buildStackRows(artifacts: Record<string, Artifact>, turns: Turn[]): StackRow[] {
  const withTurn = Object.entries(artifacts).flatMap(([artifactId, artifact]) => {
    const turn = turns.find((t) => t.artifactRef === artifactId);
    return turn ? [{ artifactId, artifact, turn }] : [];
  });

  const families = new Map<string, typeof withTurn>();
  for (const row of withTurn) {
    const family = sceneFamily(row.artifact.scene.id);
    families.set(family, [...(families.get(family) ?? []), row]);
  }

  const versioned: StackRow[] = [];
  for (const group of families.values()) {
    const byTurnOrder = [...group].sort((a, b) => a.turn.timestamp - b.turn.timestamp);
    byTurnOrder.forEach((row, index) => versioned.push({ ...row, version: index + 1 }));
  }
  return versioned.sort((a, b) => b.turn.timestamp - a.turn.timestamp);
}

// Phase 8H — the one right-side pane. Two sub-views: a list of every
// artifact this session (version chip = position within its scene
// family, status = Alert for a Monitor-module artifact else Ready, same
// tone vocabulary ArtifactCard already uses) and a detail view — the
// scene itself, exactly as Phase 8G's ArtifactPanel rendered it via
// Canvas.tsx (protected, unchanged). Opening any artifact — autoOpen, a
// stack row, an Investigate action, a pushed alert — always switches to
// detail on that artifact (one effect below, keyed on openArtifactId);
// "Back to list" only changes this component's own sub-view, never
// openArtifactId — there is always a "current" artifact once one exists.
export function ArtifactStack() {
  const artifacts = useArtifactStore((state) => state.artifacts);
  const openArtifactId = useArtifactStore((state) => state.openArtifactId);
  const stackWidth = useArtifactStore((state) => state.stackWidth);
  const setStackWidth = useArtifactStore((state) => state.setStackWidth);
  const setOpenArtifact = useArtifactStore((state) => state.setOpenArtifact);
  const toggleStack = useArtifactStore((state) => state.toggleStack);
  const isMaximized = useArtifactStore((state) => state.isMaximized);
  const toggleMaximize = useArtifactStore((state) => state.toggleMaximize);
  const turns = useSessionStore((state) => state.turns);
  const watch = useWatchlistStore((state) => state.watch);
  const [view, setView] = useState<'list' | 'detail'>('detail');

  useEffect(() => {
    if (openArtifactId) setView('detail');
  }, [openArtifactId]);

  const rows = useMemo(() => buildStackRows(artifacts, turns), [artifacts, turns]);
  const activeArtifact = openArtifactId ? artifacts[openArtifactId] : undefined;

  const resizable = useResizable({
    defaultSize: stackWidth,
    minSizePx: PANE_FLOOR,
    maxSizePx: 720,
    autoSaveId: 'merlin-artifact-stack',
  });
  useEffect(() => {
    setStackWidth(resizable.size);
  }, [resizable.size, setStackWidth]);

  // Watch buttons (EntityHeader, a registry component with no onClick of
  // its own per rule 7) are pure `data-watch-*` attributes — this
  // delegated listener is what reaches watchlistStore, same pattern
  // Phase 8G's ArtifactPanel established; Canvas.tsx itself stays
  // untouched.
  const handleWatchClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest('[data-watch-entity-id]');
    const entityId = target?.getAttribute('data-watch-entity-id');
    const label = target?.getAttribute('data-watch-label');
    if (!entityId || !label) return;
    watch(entityId, label, 'manual');
  };

  // ResizeHandle's own visible JSX removed (direct order, 2026-08-09: "hide
  // the resize hand from artifacts" — its pill sat visually inside the
  // content↔artifact gap, which is also what made that gap read as
  // different from the artifact↔transcript gap even though both are the
  // same --space-16). useResizable/its store-sync effect above stay fully
  // wired — same "keep code for future" order as the width change already
  // made this pane's ACTIVE width source the fixed-ratio CSS, not
  // resizable.size. Re-adding <ResizeHandle resizable={resizable.props}
  // isReversed pillPlacement="start" label="Resize artifact stack" /> as a
  // sibling before <Card> is the entire re-enable path if this returns.
  return (
    // data-glass-surface: useSpecularPointer's opt-in selector — a
    // behaviour hook, not a style. See PageShell.tsx's own note.
    // width: 2026-08-09 — no longer resizable.size; the fixed-ratio
    // workbench split (Frame.module.css's .artifactPane, ArtifactStackMount
    // .tsx) now owns this pane's width via flex-basis on its wrapper.
    // width:'100%' still applies when maximized — that's a genuinely
    // different state, not this ratio system's concern.
    <Card variant="default" padding={0} {...(isMaximized ? { width: '100%' } : {})} className={styles.artifactCard ?? ''} data-glass-surface>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Phase 18: overflowX contains a too-wide-for-the-pane child
            (e.g. a data-table with more columns than this pane's floor
            accounts for — data-table has no registered minWidth, since
            its column count varies per scene) to its OWN scrollbar.
            Confirmed live: without this, such content bled past the
            pane's box (overflow default: visible) and inflated the
            ROW's scrollWidth, polluting usePaneFitCollapse's fit-check
            with overflow that was never the row-level mechanism's to
            police — the pane's own contents are the pane's own problem.
            PaneTitleBar lives inside this scroll container now (direct
            feedback, 2026-08-04 — same move PageShell.tsx made for
            content panes), sticky to its top with a fade gradient over
            scrolled rows/list items, replacing the old plain (non-
            scrolling, non-gradient) Toolbar this file used to hand-roll.
            startContent carries the back button; PaneTitleBar's own
            .startGroup/.title CSS is what truncates a long scene title
            instead of wrapping it. */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
          <PaneTitleBar
            title={view === 'detail' && activeArtifact ? activeArtifact.scene.title : 'Artifacts'}
            startContent={
              view === 'detail' && activeArtifact ? (
                <IconButton
                  label="Back to list"
                  tooltip="Back to list"
                  icon={<Icon icon="chevronLeft" size="sm" />}
                  variant="ghost"
                  onClick={() => setView('list')}
                />
              ) : undefined
            }
            endContent={
              <>
                <IconButton
                  label={isMaximized ? 'Restore' : 'Maximize'}
                  tooltip={isMaximized ? 'Restore' : 'Maximize'}
                  icon={<Icon icon="arrowsUpDown" size="sm" style={{ transform: 'rotate(45deg)' }} />}
                  variant={isMaximized ? 'primary' : 'ghost'}
                  onClick={toggleMaximize}
                />
                {/* Close acts exactly like the top-bar Artifacts control
                    (same action) — one on/off state, two entry points. */}
                <IconButton
                  label="Close artifacts"
                  tooltip="Close"
                  icon={<Icon icon="close" size="sm" />}
                  variant="ghost"
                  onClick={toggleStack}
                />
              </>
            }
          />
          {view === 'detail' && activeArtifact ? (
            <div className={pane.padded} onClick={handleWatchClick}>
              <Canvas />
            </div>
          ) : (
            <div className={pane.padded}>
              <List hasDividers density="compact">
                {rows.map(({ artifactId, artifact, turn, version }) => {
                  const isMonitor = artifact.module === 'monitor';
                  return (
                    <ListItem
                      key={artifactId}
                      label={artifact.scene.title}
                      description={truncate(turn.utterance, 60)}
                      isSelected={artifactId === openArtifactId}
                      onClick={() => setOpenArtifact(artifactId)}
                      endContent={
                        <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
                          <Token label={`v${version}`} />
                          <StatusTag label={isMonitor ? 'Alert' : 'Ready'} tone={isMonitor ? 'alert' : 'ok'} />
                        </div>
                      }
                    />
                  );
                })}
              </List>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
