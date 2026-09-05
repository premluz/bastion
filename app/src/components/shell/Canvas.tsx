import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import '../../renderer/sceneExit.css';
import { useSceneStore } from '../../engine/stores/sceneStore';
import type { HydratedScene } from '../../contracts/scene';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { submitQuery } from '../../engine/submitQuery';
import { getIntentForEntity } from '../../engine/entityIntent';
import { resolveClickedEntityId } from '../../engine/entityLinkClick';
import { FollowUpChips } from './FollowUpChips';
import styles from './Canvas.module.css';

// Query → resolve → scene swap with exit/enter assembly: the outgoing
// scene fades out (merlin-exit) before the incoming one mounts fresh and
// runs its own reveal-order assembly (Phase 4's SceneRenderer, unchanged).
export function Canvas() {
  const activeScene = useSceneStore((state) => state.activeScene);
  const [displayedScene, setDisplayedScene] = useState<HydratedScene | null>(activeScene);
  const [isExiting, setIsExiting] = useState(false);
  const resolver = useMemo(() => createKeywordResolver(), []);

  // Scene-authored follow-up chips (2026-08-31, see FollowUpChips.tsx's
  // own comment) — same submitQuery/resolver already in scope for entity
  // links above, since a follow-up intent resolves through the identical
  // path a typed query does.
  const handleFollowUp = (intent: string) => void submitQuery(intent, resolver);

  // Entity links (Phase 8F) are plain `data-entity-id` spans, not
  // components with their own onClick — registry components stay in the
  // renderer layer, which may never import engine/app (one-way dependency
  // direction, CLAUDE.md §3). This delegated listener is what actually
  // bridges a click to submitQuery, and it belongs here: Canvas is app
  // shell, the one layer allowed to know about both.
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const entityId = resolveClickedEntityId(event);
    if (!entityId) return;
    const intent = getIntentForEntity(entityId);
    if (!intent) return;
    void submitQuery(intent, resolver);
  };

  useEffect(() => {
    if (activeScene === displayedScene) return;
    if (displayedScene === null) {
      setDisplayedScene(activeScene);
      return;
    }
    setIsExiting(true);
  }, [activeScene, displayedScene]);

  const handleExitEnd = () => {
    setDisplayedScene(activeScene);
    setIsExiting(false);
  };

  if (!displayedScene) {
    return <EmptyState title="No scene yet" description="Ask a question above to bring up an interface." />;
  }

  return (
    <div
      style={
        isExiting
          ? {
              animationName: 'merlin-exit',
              animationDuration: 'var(--motion-exit-duration)',
              animationTimingFunction: 'var(--motion-exit-ease)',
              animationFillMode: 'forwards',
            }
          : undefined
      }
      onAnimationEnd={isExiting ? handleExitEnd : undefined}
      onClick={handleClick}
      className={styles.content}
    >
      <SceneRenderer key={displayedScene.id} scene={displayedScene} />
      {displayedScene.followUps && displayedScene.followUps.length > 0 && (
        <FollowUpChips items={displayedScene.followUps} onSelect={handleFollowUp} />
      )}
    </div>
  );
}
