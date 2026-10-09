import { useSendMoneyFlows } from '../../engine/useSendMoneyFlows';
import { useTopUpFlows } from '../../engine/useTopUpFlows';
import { parseSendVoiceChoice } from '../../engine/sendMoneyVoiceChoice';
import { isTopUpFinished, parseTopUpVoice } from '../../engine/mortgageTopUpState';
import { topUpNarration } from '../../engine/mortgageTopUpScenes';
import { AGENDA, parseOfferAnswer } from '../../engine/agentAgenda';
import { sendNarration } from './sendVoiceCues';
import type { NarrationTarget } from './useVoiceNarration';
import type { useMobileFrame } from './useMobileFrame';

// Every scenario in one thread (2026-10-09, direct feedback: go over several
// recommended actions with the agent in one voice session). Each scenario
// runs its own flows; this routes what the user says to whichever scenario or
// offer is waiting on an answer, and picks what the assistant says next.
export function useScenarioThread(state: ReturnType<typeof useMobileFrame>) {
  const send = useSendMoneyFlows(state.messages);
  const topUp = useTopUpFlows(state.messages);

  // The most recent turn still waiting on the user decides what an answer means.
  const routeVoice = (text: string): (() => void) | null => {
    const latest = state.messages.at(-1);
    for (const message of [...state.messages].reverse()) {
      if (message.agendaOffer) {
        if (message !== latest) return null;
        const item = AGENDA.find((candidate) => candidate.id === message.agendaOffer);
        const answer = parseOfferAnswer(text);
        if (!item || !answer) return null;
        return answer === 'yes' ? () => state.submit(text, 'voice', item.prompt) : () => state.decline(text, item.id);
      }
      const sendFlow = send.flows[message.id];
      if (sendFlow?.stage === 'options' || sendFlow?.stage === 'review') {
        const action = parseSendVoiceChoice(text, sendFlow);
        return action ? () => send.dispatch(message.id, action) : null;
      }
      const topUpFlow = topUp.flows[message.id];
      if (topUpFlow && (topUpFlow.stage === 'options' || topUpFlow.stage === 'review')) {
        const action = parseTopUpVoice(text, topUpFlow);
        return action ? () => topUp.dispatch(message.id, action) : null;
      }
    }
    return null;
  };

  // Every turn's current line, oldest first: a scenario keeps narrating (and
  // advancing on its clips) even when something newer was said meanwhile.
  const narrationTargets = (): NarrationTarget[] => state.messages.flatMap((message): NarrationTarget[] => {
    if (message.role === 'assistant') return [{ id: message.id, line: { key: 'say', text: message.text } }];
    const topUpFlow = topUp.flows[message.id];
    if (topUpFlow && (message.source === 'voice' || topUpFlow.stage === 'sending')) return [{ id: message.id, line: topUpNarration(topUpFlow) }];
    const sendFlow = send.flows[message.id];
    if (sendFlow && (message.source === 'voice' || sendFlow.stage === 'confirming' || sendFlow.stage === 'sending'))
      return [{ id: message.id, line: sendNarration(sendFlow, (action) => send.dispatch(message.id, action)) }];
    if (message.source === 'voice' && message.voiceFeedback) return [{ id: message.id, line: { key: 'feedback', text: message.voiceFeedback } }];
    return [];
  });

  const isFinished = (id: number) => {
    const sendFlow = send.flows[id];
    if (sendFlow) return sendFlow.stage === 'sent' || sendFlow.stage === 'cancelled';
    const topUpFlow = topUp.flows[id];
    return topUpFlow ? isTopUpFinished(topUpFlow) : false;
  };

  return { send, topUp, routeVoice, narrationTargets: narrationTargets(), isFinished };
}
