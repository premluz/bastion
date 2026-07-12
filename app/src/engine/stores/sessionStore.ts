import { create } from "zustand";
import type { ThinkingStep } from "../../contracts/thinking";

export type TurnStatus = "resolved" | "unresolved";

// A turn is the durable record of one utterance — status is set the
// moment the resolver answers (matches the prior ChatEntry semantics
// InvestigationHeader/QueryLog already depend on); `trail`/`artifactRef`
// stay empty until the trail actually settles, since only one trail plays
// at a time (trailStore, unchanged) — this is the frozen copy of it.
export interface Turn {
  id: string;
  utterance: string;
  status: TurnStatus;
  sceneTitle?: string | undefined;
  trail: ThinkingStep[];
  trailElapsedMs: number;
  artifactRef?: string | undefined;
  timestamp: number;
}

interface SessionState {
  turns: Turn[];
  addTurn: (turn: Turn) => void;
  settleTurn: (
    id: string,
    settled: { trail: ThinkingStep[]; trailElapsedMs: number; artifactRef: string },
  ) => void;
  // Phase 8C: "New investigation" — clears turns only. Frame's existing
  // `hasStarted = turnCount > 0` gate (unchanged) is what actually returns
  // the shell to LandingState; artifactStore/sceneStore entries from the
  // cleared session become unreachable (nothing renders them once
  // hasStarted is false) rather than being separately torn down — no
  // second store needs a new action for this to be correct.
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  turns: [],
  addTurn: (turn) => set((state) => ({ turns: [...state.turns, turn] })),
  settleTurn: (id, settled) =>
    set((state) => ({
      turns: state.turns.map((turn) => (turn.id === id ? { ...turn, ...settled } : turn)),
    })),
  reset: () => set({ turns: [] }),
}));
