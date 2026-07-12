import type { MouseEvent } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Toolbar } from '@astryxdesign/core/Toolbar';
import { Text } from '@astryxdesign/core/Text';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { Canvas } from './Canvas';

// Right-side panel per Astryx's ai-chat template artifact preview
// (.astryx-scratch/ai-chat/page.tsx lines ~692-726: Toolbar as the card
// header, body below). Canvas.tsx renders inside it completely
// unchanged (Phase 8B WO-1/WO-2 invariant) — its own exit/enter assembly
// stagger still drives the scene; this panel only supplies the
// surrounding chrome and the close affordance.
export function ArtifactPanel({ width }: { width: number }) {
  const openArtifactId = useArtifactStore((state) => state.openArtifactId);
  const artifact = useArtifactStore((state) => (state.openArtifactId ? state.artifacts[state.openArtifactId] : null));
  const setOpenArtifact = useArtifactStore((state) => state.setOpenArtifact);
  const watch = useWatchlistStore((state) => state.watch);

  // Watch buttons (Phase 8G WO-2, EntityHeader) are pure `data-watch-*`
  // attributes with no onClick of their own — same rule-7 pattern as
  // Phase 8F's entity-link routing. Canvas.tsx stays untouched (Phase 8G's
  // engine invariant covers the whole phase, both work orders), so this
  // second, independent delegated listener lives one layer up, on the
  // wrapper that already surrounds Canvas — same shell layer, a different
  // action from entity-link routing, not a parallel version of it.
  const handleWatchClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest('[data-watch-entity-id]');
    const entityId = target?.getAttribute('data-watch-entity-id');
    const label = target?.getAttribute('data-watch-label');
    if (!entityId || !label) return;
    watch(entityId, label, 'manual');
  };

  if (!openArtifactId || !artifact) return null;

  return (
    <Card variant="default" padding={0} width={width} height="100%">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ borderBottom: '1px solid var(--edge)' }}>
          <Toolbar
            label="Artifact actions"
            startContent={
              <Text type="label" weight="semibold">
                {artifact.scene.title}
              </Text>
            }
            endContent={
              <IconButton
                label="Close artifact"
                icon={<Icon icon="close" size="sm" />}
                variant="ghost"
                onClick={() => setOpenArtifact(null)}
              />
            }
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-16)' }} onClick={handleWatchClick}>
          <Canvas />
        </div>
      </div>
    </Card>
  );
}
