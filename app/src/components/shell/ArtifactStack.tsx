import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Toolbar } from '@astryxdesign/core/Toolbar';
import { Text } from '@astryxdesign/core/Text';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { List, ListItem } from '@astryxdesign/core/List';
import { Token } from '@astryxdesign/core/Token';
import { ResizeHandle, useResizable } from '@astryxdesign/core/Resizable';
import { useArtifactStore, type Artifact } from '../../engine/stores/artifactStore';
import { useSessionStore, type Turn } from '../../engine/stores/sessionStore';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { StatusTag } from '../nodes/StatusTag';
import { Canvas } from './Canvas';

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

// Session lineage, display only — a refine turn's scene shares its
// parent's id with a `-refine` suffix (the only chain in the fixture
// data today; node-vocabulary.md's routing law names this "scene
// family"). Computed live from existing ids, nothing persisted.
function sceneFamily(sceneId: string): string {
  return sceneId.replace(/-refine$/, '');
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
    minSizePx: 360,
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

  return (
    <>
      {!isMaximized && (
        <ResizeHandle
          direction="horizontal"
          resizable={resizable.props}
          isReversed
          pillPlacement="start"
          hasDivider
          label="Resize artifact stack"
        />
      )}
      <Card variant="default" padding={0} width={isMaximized ? '100%' : resizable.size} height="100%">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ borderBottom: '1px solid var(--edge)' }}>
            <Toolbar
              label="Artifact stack actions"
              startContent={
                view === 'detail' && activeArtifact ? (
                  <IconButton
                    label="Back to list"
                    tooltip="Back to list"
                    icon={<Icon icon="chevronLeft" size="sm" />}
                    variant="ghost"
                    onClick={() => setView('list')}
                  />
                ) : (
                  <Text type="label" weight="semibold">
                    Artifacts
                  </Text>
                )
              }
              endContent={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                  {view === 'detail' && activeArtifact && (
                    <Text type="label" weight="semibold">
                      {activeArtifact.scene.title}
                    </Text>
                  )}
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
                </div>
              }
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {view === 'detail' && activeArtifact ? (
              <div style={{ padding: 'var(--space-16)' }} onClick={handleWatchClick}>
                <Canvas />
              </div>
            ) : (
              <div style={{ padding: 'var(--space-16)' }}>
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
    </>
  );
}
