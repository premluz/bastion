import { useMemo } from 'react';
import { applyPaymentRequestAction, createPaymentRequestState, isPaymentRequestWaiting, tickPaymentRequest,
  type PaymentRequest, type PaymentRequestAction, type PaymentRequestState } from './paymentRequestState';
import { paymentRequestStepDurations } from './paymentRequestScenes';
import { useFlowRunner, type ScenarioKind } from './useFlowRunner';

const paymentRequestKind: ScenarioKind<PaymentRequest, PaymentRequestState, PaymentRequestAction> = {
  create: (_request, now) => createPaymentRequestState(now, paymentRequestStepDurations[0] ?? 0),
  apply: applyPaymentRequestAction,
  tick: (state, now) => tickPaymentRequest(state, now, paymentRequestStepDurations),
  deadline: (state) => isPaymentRequestWaiting(state) ? state.dueAt : null,
};

type PaymentRequestMessage = { id: number; paymentRequest?: PaymentRequest };
export function usePaymentRequestFlows(messages: PaymentRequestMessage[]) {
  const requests = useMemo(() => messages.map(({ id, paymentRequest }) => ({ id, request: paymentRequest })), [messages]);
  return useFlowRunner(requests, paymentRequestKind);
}
