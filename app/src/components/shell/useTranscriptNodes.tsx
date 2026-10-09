import { ChatMessage, ChatMessageBubble } from '@astryxdesign/core/Chat';
import { Text } from '@astryxdesign/core/Text';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import { ThinkingTrail } from '../trail/ThinkingTrail';
import { useTrailStore } from '../../engine/stores/trailStore';
import { useBuyEthFlow } from '../../engine/useBuyEthFlow';
import type { useScenarioThread } from './useScenarioThread';
import { BuyEthTranscriptView } from './BuyEthTranscript';
import { SendMoneyTranscript } from './SendMoneyTranscript';
import { TopUpTranscript } from './TopUpTranscript';
import type { useMobileFrame } from './useMobileFrame';
import styles from './MobileFrame.module.css';

// The shell's one transcript (lifted out of MobileFrame.tsx 2026-10-09 when
// the agent home added a third place it renders): the same nodes mount in
// the composer overlay, the conversation overlay and the agent home's
// in-place thread.
export function useTranscriptNodes(state: ReturnType<typeof useMobileFrame>, { send, topUp }: ReturnType<typeof useScenarioThread>,
  sendPresentation: 'inline' | 'overlay') {
  // Live trail state (2026-09-13) — subscribed via the hook, not
  // getState(), so this component re-renders as playTrail advances
  // activeIndex/elapsedMs. Read unconditionally (cheap, a handful of
  // primitives) and applied only to the one message useMobileFrame marks
  // as liveTrailMessageId — the same "one turn in flight" model
  // useTrailStore's own single-slot shape assumes on desktop.
  const liveSteps = useTrailStore((trail) => trail.steps);
  const liveActiveIndex = useTrailStore((trail) => trail.activeIndex);
  const liveIsComplete = useTrailStore((trail) => trail.isComplete);
  const liveElapsedMs = useTrailStore((trail) => trail.elapsedMs);
  const liveSkip = useTrailStore((trail) => trail.skip);
  // One flow for the whole shell, not one per rendered transcript
  // (2026-09-13): the same transcript array mounts in both the composer
  // surface and the conversation overlay, so a flow owned inside the
  // transcript ran twice, with two independent timer sets. Hooks cannot
  // run per-item inside the map below, so this keys off the most recent
  // buy message — the only one whose flow is actually in play.
  const latestBuyAmount = [...state.messages].reverse().find((message) => message.buyAmount != null)?.buyAmount ?? 0;
  const buyFlow = useBuyEthFlow(latestBuyAmount);
  // Resolved scenes render right after their own message and its thinking
  // trail (2026-09-13) — same shape BuyEthTranscript.tsx already
  // established for the buy-flow's own hand-built scenes (<ChatMessage>
  // for the query, content beneath it for the result), and the same
  // trail-before-scene sequencing presentScene.ts already establishes on
  // desktop: the trail plays first, the scene attaches once it settles.
  // A message with neither a live trail nor a settled one (still
  // resolving, or the resolver found no match) renders as plain text.
  const voice = state.mode === 'conversation';
  const transcript = state.messages.map(({ id, text, scene, trail, trailElapsedMs, buyAmount, voiceFeedback, role }) => {
    const isLive = state.liveTrailMessageId === id;
    // The assistant speaking on its own (an agenda handover): no user turn.
    if (role === 'assistant') return (
      <div key={id}><ChatMessage sender="assistant"><Text type="body" as="p" className={styles.agentReply}>{text}</Text></ChatMessage></div>
    );
    const topUpFlow = topUp.flows[id];
    return (
      <div key={id}>
        <ChatMessage sender="user"><ChatMessageBubble>{text}</ChatMessageBubble></ChatMessage>
        {voiceFeedback && <ChatMessage sender="assistant"><Text type="body" as="p" className={styles.agentReply}>{voiceFeedback}</Text></ChatMessage>}
        {isLive && (
          <ThinkingTrail steps={liveSteps} activeIndex={liveActiveIndex} isComplete={liveIsComplete}
            elapsedMs={liveElapsedMs} skip={liveSkip} />
        )}
        {!isLive && trail && (
          <ThinkingTrail steps={trail} activeIndex={trail.length - 1} isComplete elapsedMs={trailElapsedMs ?? 0} skip={null} />
        )}
        {scene && <SceneRenderer scene={scene} />}
        {send.flows[id] && <SendMoneyTranscript state={send.flows[id]} presentation={sendPresentation}
          interactionMode={voice ? 'voice' : 'chat'}
          dispatch={(action) => send.dispatch(id, action)} />}
        {topUpFlow && <TopUpTranscript state={topUpFlow} presentation={sendPresentation} voice={voice}
          dispatch={(action) => topUp.dispatch(id, action)} />}
        {/* Buy flow renders inline, as one more result under its own
            message (2026-09-13, direct feedback: "inline — for all
            scenarios entering into composer just runs the scenario in
            that view, unless the conversation icon is clicked"). This
            replaces a whole-shell early return that unmounted the entire
            frame, which is why Enter looked like it jumped to
            conversation mode: the nav and composer were not hidden, the
            shell itself was gone. hideQuery suppresses BuyEthTranscript's
            own user bubble — the loop above already drew one for this
            same message. */}
        {buyAmount != null && <BuyEthTranscriptView query={text} amount={buyAmount} hideQuery flow={buyFlow} />}
      </div>
    );
  });
  return transcript;
}
