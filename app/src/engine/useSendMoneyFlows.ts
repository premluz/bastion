import { useMemo } from 'react';
import { createSendState, applySendAction, type SendAction, type SendRequest, type SendState } from './sendMoneyState';
import { sendOptions, sendReview, tickSend } from './sendMoneyScenes';
import { useFlowRunner, type ScenarioKind } from './useFlowRunner';

const sendKind: ScenarioKind<SendRequest, SendState, SendAction> = {
  create: (request, now) => createSendState(request, now, sendOptions.thinking[0]!.durationMs),
  apply: (state, action, now) => applySendAction(state, action, now, sendReview.thinking[0]!.durationMs),
  tick: tickSend,
  deadline: (state) => state.stage === 'checking' || state.stage === 'moving' || state.stage === 'sending' ? state.dueAt : null,
};

type SendMessage = { id: number; sendRequest?: SendRequest };
export function useSendMoneyFlows(messages: SendMessage[]) {
  const requests = useMemo(() => messages.map(({ id, sendRequest }) => ({ id, request: sendRequest })), [messages]);
  return useFlowRunner(requests, sendKind);
}
