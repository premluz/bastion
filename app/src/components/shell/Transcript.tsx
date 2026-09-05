import { useMemo, useRef, type MouseEvent } from 'react';
import { ChatMessage, ChatMessageBubble } from '@astryxdesign/core/Chat';
import { Text } from '@astryxdesign/core/Text';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import type { HydratedScene } from '../../contracts/scene';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { useTrailStore } from '../../engine/stores/trailStore';
import { usePageStore } from '../../engine/stores/pageStore';
import { resolveClickedEntityId } from '../../engine/entityLinkClick';
import { ThinkingTrail } from '../trail/ThinkingTrail';
import { ArtifactCard } from './ArtifactCard';
import { FollowUpChips } from './FollowUpChips';
import { useScrollIntoViewOnGrow } from './ScrollAnchor';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { submitQuery } from '../../engine/submitQuery';

// Extracted so useScrollIntoViewOnGrow (a hook) can attach to a per-turn
// ref — Transcript.tsx's own turn list is a plain .map() callback, which
// can't call hooks directly. Watches ITS OWN wrapper only (see
// ScrollAnchor.tsx's own comment for why this is scoped this narrowly,
// not the whole transcript): asset-card-grid's lazy chunk resolving well
// after the turn settles is the one real async-mount case this exists
// for today.
function InlineSceneBlock({ scene, onClick }: { scene: HydratedScene; onClick: (event: MouseEvent<HTMLDivElement>) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollIntoViewOnGrow(ref);
  return (
    <div ref={ref} onClick={onClick}>
      <SceneRenderer scene={scene} />
    </div>
  );
}

// Conversation layout adopted from Astryx's ai-chat template
// (.astryx-scratch/ai-chat/page.tsx): user turns right (ChatMessage
// sender="user" + ChatMessageBubble — unchanged from the Phase 8
// shell-craft session), agent activity left (ChatMessage
// sender="assistant", raw children — never ChatMessageBubble, per
// node-vocabulary.md's Trail law: "reads as work being done, never as a
// fake chat transcript"; no avatar either, since Merlin has no assistant
// persona). Each turn pairs both sides. The last still-unsettled resolved
// turn reads its trail live from trailStore; every other turn reads its
// own frozen `turn.trail` (Phase 8B WO-1) — same ThinkingTrail component
// either way, just fed a different data source.
//
// Investigation threading order: scoped to activeThreadId — only that
// thread's own turns render, isolating each investigation's transcript
// from every other one in session history rather than showing the
// entire flat turns array.
export function Transcript() {
  const turns = useSessionStore((state) => state.turns);
  const activeThreadId = useSessionStore((state) => state.activeThreadId);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const setOpenArtifact = useArtifactStore((state) => state.setOpenArtifact);
  const liveSteps = useTrailStore((state) => state.steps);
  const liveActiveIndex = useTrailStore((state) => state.activeIndex);
  const liveIsComplete = useTrailStore((state) => state.isComplete);
  const liveElapsedMs = useTrailStore((state) => state.elapsedMs);
  const liveSkip = useTrailStore((state) => state.skip);
  const openEntityDetail = usePageStore((state) => state.openEntityDetail);
  const resolver = useMemo(() => createKeywordResolver(), []);

  const threadTurns = useMemo(() => turns.filter((turn) => turn.threadId === activeThreadId), [turns, activeThreadId]);

  // Entity-link delegated listener (Phase 21, 2026-08-30, CLAUDE.md §3's
  // own inline-mount law) — same mechanism as Canvas.tsx's/DashboardPage.tsx's
  // own (data-entity-id + resolveClickedEntityId from entityLinkClick.ts),
  // routed to openEntityDetail: an inline result is browse-shaped by
  // construction (the three-way routing split's own first bucket), so a
  // card click means "go look at this entity," never "investigate this
  // as a new query" (that's Canvas.tsx's own, different routing, for the
  // artifact-stack context). Lives here rather than per-node since
  // SceneRenderer itself carries no click delegation of its own (rule 6,
  // "components are pure and dumb").
  const handleInlineSceneClick = (event: MouseEvent<HTMLDivElement>) => {
    const entityId = resolveClickedEntityId(event);
    if (entityId) openEntityDetail(entityId);
  };

  if (threadTurns.length === 0) return null;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-24)' }}>
      {threadTurns.map((turn, index) => {
        // Neither settled slot populated (Phase 21 — see sessionStore.ts's
        // own comment on why artifactRef alone under-counts "still live"
        // once an inline turn can settle without ever setting it).
        const isLive = index === threadTurns.length - 1 && turn.status === 'resolved' && !turn.artifactRef && !turn.inlineScene;
        const steps = isLive ? liveSteps : turn.trail;
        const activeIndex = isLive ? liveActiveIndex : turn.trail.length - 1;
        const isComplete = isLive ? liveIsComplete : true;
        const elapsedMs = isLive ? liveElapsedMs : turn.trailElapsedMs;
        const skip = isLive ? liveSkip : null;
        const sourceCount = new Set(steps.flatMap((step) => step.sources?.map((source) => source.name) ?? [])).size;
        const artifact = turn.artifactRef ? artifacts[turn.artifactRef] : undefined;
        const settledScene = turn.inlineScene ?? artifact?.scene;
        const isLastTurn = index === threadTurns.length - 1;

        return (
          <div key={turn.id} style={{ display: 'grid', gap: 'var(--space-12)' }}>
            <ChatMessage sender="user">
              <ChatMessageBubble>
                {turn.utterance}
              </ChatMessageBubble>
            </ChatMessage>

            {turn.status === 'resolved' && (
              <ChatMessage sender="assistant">
                <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center' }}>
                    <Text type="supporting">
                      {sourceCount} source{sourceCount === 1 ? '' : 's'}
                    </Text>
                    <Text type="supporting" color="disabled" hasTabularNumbers>
                      {steps.length > 0 ? `${(elapsedMs / 1000).toFixed(1)}s` : '—'}
                    </Text>
                  </div>
                  <ThinkingTrail
                    steps={steps}
                    activeIndex={activeIndex}
                    isComplete={isComplete}
                    elapsedMs={elapsedMs}
                    skip={skip}
                  />
                  {artifact && (
                    <ArtifactCard
                      title={artifact.scene.title}
                      module={artifact.module}
                      onOpen={() => setOpenArtifact(turn.artifactRef ?? null)}
                    />
                  )}
                  {turn.inlineScene && <InlineSceneBlock scene={turn.inlineScene} onClick={handleInlineSceneClick} />}
                  {/* Only the thread's own last turn offers follow-ups
                      (2026-08-31) — an earlier turn's "next step" chips
                      would be stale once a later turn has already moved
                      the conversation on. Scene-authored (Scene.followUps,
                      contracts/scene.ts's own SceneFollowUpSchema), read
                      off whichever settled slot this turn actually used. */}
                  {isLastTurn && settledScene?.followUps && settledScene.followUps.length > 0 && (
                    <FollowUpChips items={settledScene.followUps} onSelect={(intent) => void submitQuery(intent, resolver)} />
                  )}
                </div>
              </ChatMessage>
            )}
          </div>
        );
      })}
    </div>
  );
}
