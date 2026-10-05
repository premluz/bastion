import { useEffect, useState } from 'react';
import { createSendState, applySendAction, type SendAction, type SendRequest, type SendState } from './sendMoneyState';
import { sendOptions, sendReview, tickSend } from './sendMoneyScenes';

type SendMessage = { id: number; sendRequest?: SendRequest };
export function useSendMoneyFlows(messages: SendMessage[]) {
  const [flows, setFlows] = useState<Record<number, SendState>>({});
  useEffect(() => {
    setFlows((current) => {
      const missing = messages.filter((message) => message.sendRequest && !current[message.id]);
      if (!missing.length) return current;
      const next = { ...current };
      for (const message of missing) if (message.sendRequest)
        next[message.id] = createSendState(message.sendRequest, Date.now(), sendOptions.thinking[0]!.durationMs);
      return next;
    });
  }, [messages]);
  useEffect(() => {
    const deadlines = Object.values(flows).filter((state) => state.stage === 'checking' || state.stage === 'moving' || state.stage === 'sending').map((state) => state.dueAt);
    if (!deadlines.length) return;
    const timer = setTimeout(() => setFlows((current) => Object.fromEntries(
      Object.entries(current).map(([id, state]) => [id, tickSend(state, Date.now())]),
    )), Math.max(0, Math.min(...deadlines) - Date.now()));
    return () => clearTimeout(timer);
  }, [flows]);
  const dispatch = (id: number, action: SendAction) => setFlows((current) => {
    const state = current[id];
    return state ? { ...current, [id]: applySendAction(state, action, Date.now(), sendReview.thinking[0]!.durationMs) } : current;
  });
  return { flows, dispatch };
}
