import { useMemo } from 'react';
import { applyTopUpAction, createTopUpState, isTopUpWaiting, tickTopUp, type TopUpAction, type TopUpRequest, type TopUpState } from './mortgageTopUpState';
import { topUpStepDurations } from './mortgageTopUpScenes';
import { useFlowRunner, type ScenarioKind } from './useFlowRunner';

const topUpKind: ScenarioKind<TopUpRequest, TopUpState, TopUpAction> = {
  create: (_request, now) => createTopUpState(now, topUpStepDurations[0] ?? 0),
  apply: applyTopUpAction,
  tick: (state, now) => tickTopUp(state, now, topUpStepDurations),
  deadline: (state) => isTopUpWaiting(state) ? state.dueAt : null,
};

type TopUpMessage = { id: number; topUpRequest?: TopUpRequest };
export function useTopUpFlows(messages: TopUpMessage[]) {
  const requests = useMemo(() => messages.map(({ id, topUpRequest }) => ({ id, request: topUpRequest })), [messages]);
  return useFlowRunner(requests, topUpKind);
}
