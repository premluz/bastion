import { useMemo } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { StatusDot, type StatusDotVariant } from '@astryxdesign/core/StatusDot';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { useSceneStore } from '../../engine/stores/sceneStore';
import { IndexPaneShell } from './IndexPaneShell';

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Index pane (Phase 8G WO-2): the session's full turn list, newest
// first — independent of Sidebar's module grouping, a flat chronological
// record rather than an investigation-navigation view. Opening a past
// turn reuses the exact same reopen path Sidebar's own row click and
// ArtifactCard already use (setOpenArtifact + setActiveScene) — no
// parallel mechanism, and the workbench's existing artifactStore
// subscription (workbenchStore.ts) is what actually surfaces the
// artifact pane again, same as every other reopen trigger this phase.
export function HistoryPane({ width }: { width: number }) {
  const turns = useSessionStore((state) => state.turns);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const setOpenArtifact = useArtifactStore((state) => state.setOpenArtifact);
  const setActiveScene = useSceneStore((state) => state.setActiveScene);

  const rows = useMemo(() => [...turns].reverse(), [turns]);

  function openTurn(artifactRef: string) {
    const artifact = artifacts[artifactRef];
    if (!artifact) return;
    setOpenArtifact(artifactRef);
    setActiveScene(artifact.scene);
  }

  return (
    <IndexPaneShell paneKind="history" title="History" width={width}>
      {rows.length === 0 ? (
        <EmptyState title="No history yet" description="Turns you ask this session will appear here." />
      ) : (
        <List hasDividers density="compact">
          {rows.map((turn) => {
            const artifactRef = turn.artifactRef;
            const dot: { variant: StatusDotVariant; label: string } =
              turn.status === 'unresolved'
                ? { variant: 'neutral', label: 'No match' }
                : artifacts[artifactRef ?? '']?.module === 'monitor'
                  ? { variant: 'error', label: 'Alert' }
                  : { variant: 'success', label: 'Answered' };
            const endContent = artifactRef ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <StatusDot variant={dot.variant} label={dot.label} />
                <IconButton
                  label={`Open ${turn.utterance}`}
                  tooltip="Open artifact"
                  icon={<Icon icon="externalLink" size="sm" />}
                  variant="ghost"
                  size="sm"
                  onClick={() => openTurn(artifactRef)}
                />
              </div>
            ) : (
              <StatusDot variant={dot.variant} label={dot.label} />
            );
            return (
              <ListItem
                key={turn.id}
                label={truncate(turn.utterance, 48)}
                description={formatTimestamp(turn.timestamp)}
                isDisabled={!artifactRef}
                endContent={endContent}
              />
            );
          })}
        </List>
      )}
    </IndexPaneShell>
  );
}
