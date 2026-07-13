import { create } from "zustand";
import type { ThinkingStep } from "../../contracts/thinking";

export type TurnStatus = "resolved" | "unresolved" | "interrupted";

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
  // Only one trail plays at a time (trailPlayer's own generation counter),
  // so submitting a new query while a previous one is still resolved-but-
  // unsettled (status "resolved", no artifactRef yet — trailPlayer.ts's
  // isCurrent() guard means that old turn's settleTurn will now never
  // fire) permanently orphans it. Left as "resolved" it would satisfy
  // every "isThinking"/"pulsing" check forever, alongside the genuinely
  // active new turn — the real cause of two Recent rows reading as
  // simultaneously selected. Marking it "interrupted" here, the one place
  // a turn can be superseded, keeps every consumer honest without each
  // one re-deriving "is this actually still in flight."
  addTurn: (turn) =>
    set((state) => ({
      turns: [
        ...state.turns.map((existing) =>
          existing.status === "resolved" && !existing.artifactRef
            ? { ...existing, status: "interrupted" as const }
            : existing,
        ),
        turn,
      ],
    })),
  settleTurn: (id, settled) =>
    set((state) => ({
      turns: state.turns.map((turn) => (turn.id === id ? { ...turn, ...settled } : turn)),
    })),
  reset: () => set({ turns: [] }),
}));
