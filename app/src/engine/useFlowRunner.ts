import { useEffect, useState } from 'react';

// One scenario's behaviour, as pure functions (2026-10-09): the runner below
// owns the per-message state, the timers and dispatch for any scenario.
export interface ScenarioKind<R, S, A> {
  create: (request: R, now: number) => S;
  apply: (state: S, action: A, now: number) => S;
  tick: (state: S, now: number) => S;
  /** When the state next changes on its own, or null while it waits on the user. */
  deadline: (state: S) => number | null;
}

// Runs every message's flow of one scenario kind side by side, so one thread
// can hold several scenarios (and several runs of the same one).
export function useFlowRunner<R, S, A>(requests: readonly { id: number; request?: R | undefined }[], kind: ScenarioKind<R, S, A>) {
  const [flows, setFlows] = useState<Record<number, S>>({});
  useEffect(() => {
    setFlows((current) => {
      const missing = requests.filter((entry) => entry.request !== undefined && !(entry.id in current));
      if (!missing.length) return current;
      const next = { ...current };
      for (const entry of missing) if (entry.request !== undefined) next[entry.id] = kind.create(entry.request, Date.now());
      return next;
    });
  }, [requests, kind]);
  useEffect(() => {
    const deadlines = Object.values(flows).map(kind.deadline).filter((value): value is number => value !== null);
    if (!deadlines.length) return;
    const timer = setTimeout(() => setFlows((current) => Object.fromEntries(
      Object.entries(current).map(([id, state]) => [id, kind.tick(state, Date.now())]),
    )), Math.max(0, Math.min(...deadlines) - Date.now()));
    return () => clearTimeout(timer);
  }, [flows, kind]);
  const dispatch = (id: number, action: A) => setFlows((current) => {
    const state = current[id];
    return state === undefined ? current : { ...current, [id]: kind.apply(state, action, Date.now()) };
  });
  return { flows, dispatch };
}
