import { useEffect } from 'react';
import { ALL_DONE_LINE, handoverLine, nextAgendaItem } from '../../engine/agentAgenda';
import type { useMobileFrame } from './useMobileFrame';

// Going over the recommended actions (2026-10-09, direct feedback): once the
// thread's latest scenario finishes — or the user's request had none, or they
// declined the last offer — the agent offers the next action not yet handled.
export function useAgentAgenda(state: ReturnType<typeof useMobileFrame>, isFinished: (id: number) => boolean, enabled: boolean, threadStart: number) {
  const { messages, say } = state;
  useEffect(() => {
    if (!enabled) return;
    const thread = messages.slice(threadStart);
    const last = thread.at(-1);
    if (!last || last.role === 'assistant') return;
    // Never talk over a scenario still in progress, whatever was said since.
    if (thread.some((message) => (message.sendRequest || message.topUpRequest) && !isFinished(message.id))) return;
    const settled = last.sendRequest || last.topUpRequest ? isFinished(last.id) : Boolean(last.voiceFeedback || last.declinedOffer);
    if (!settled) return;
    const handled = new Set<string>();
    for (const message of thread) {
      if (message.topUpRequest) handled.add('mortgage');
      if (message.sendRequest) handled.add('payment-request');
      if (message.declinedOffer) handled.add(message.declinedOffer);
    }
    const item = nextAgendaItem(handled);
    if (item) say(handoverLine(item, handled.size === 0), item.id);
    else say(ALL_DONE_LINE);
  }, [enabled, messages, threadStart, isFinished, say]);
}
