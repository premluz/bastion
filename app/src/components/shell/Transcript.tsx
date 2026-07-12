import { ChatMessage, ChatMessageBubble, ChatMessageMetadata } from '@astryxdesign/core/Chat';
import { Text } from '@astryxdesign/core/Text';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { useSceneStore } from '../../engine/stores/sceneStore';
import { useTrailStore } from '../../engine/stores/trailStore';
import { StatusTag } from '../nodes/StatusTag';
import { ThinkingTrail } from '../trail/ThinkingTrail';
import { ArtifactCard } from './ArtifactCard';

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
export function Transcript() {
  const turns = useSessionStore((state) => state.turns);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const setOpenArtifact = useArtifactStore((state) => state.setOpenArtifact);
  const setActiveScene = useSceneStore((state) => state.setActiveScene);
  const liveSteps = useTrailStore((state) => state.steps);
  const liveActiveIndex = useTrailStore((state) => state.activeIndex);
  const liveIsComplete = useTrailStore((state) => state.isComplete);
  const liveElapsedMs = useTrailStore((state) => state.elapsedMs);
  const liveSkip = useTrailStore((state) => state.skip);

  if (turns.length === 0) return null;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-24)' }}>
      {turns.map((turn, index) => {
        const isLive = index === turns.length - 1 && turn.status === 'resolved' && !turn.artifactRef;
        const steps = isLive ? liveSteps : turn.trail;
        const activeIndex = isLive ? liveActiveIndex : turn.trail.length - 1;
        const isComplete = isLive ? liveIsComplete : true;
        const elapsedMs = isLive ? liveElapsedMs : turn.trailElapsedMs;
        const skip = isLive ? liveSkip : null;
        const sourceCount = new Set(steps.flatMap((step) => step.sources?.map((source) => source.name) ?? [])).size;
        const artifact = turn.artifactRef ? artifacts[turn.artifactRef] : undefined;

        return (
          <div key={turn.id} style={{ display: 'grid', gap: 'var(--space-12)' }}>
            <ChatMessage sender="user">
              <ChatMessageBubble
                metadata={
                  <ChatMessageMetadata
                    footer={
                      <StatusTag
                        label={turn.status === 'resolved' ? 'Answered' : 'No scene matched'}
                        tone={turn.status === 'resolved' ? 'ok' : 'neutral'}
                      />
                    }
                  />
                }
              >
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
                      onOpen={() => {
                        setOpenArtifact(turn.artifactRef ?? null);
                        setActiveScene(artifact.scene);
                      }}
                    />
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
