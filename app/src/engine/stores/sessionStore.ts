import { create } from "zustand";
import type { ThinkingStep } from "../../contracts/thinking";
import { sceneFamily } from "../sceneFamily";

export type TurnStatus = "resolved" | "unresolved" | "interrupted";

// A turn is the durable record of one utterance — status is set the
// moment the resolver answers (matches the prior ChatEntry semantics
// InvestigationHeader/QueryLog already depend on); `trail`/`artifactRef`
// stay empty until the trail actually settles, since only one trail plays
// at a time (trailStore, unchanged) — this is the frozen copy of it.
//
// sceneId (Investigation threading order): the raw resolved scene id,
// distinct from sceneTitle — needed for lineage matching via
// sceneFamily(), which operates on ids, not display titles. Undefined
// for unresolved turns, which have no scene to derive a family from.
// threadId is computed by addTurn itself (see its own comment) — never
// supplied by a caller, so there is exactly one place this logic lives.
export interface Turn {
  id: string;
  utterance: string;
  status: TurnStatus;
  sceneTitle?: string | undefined;
  sceneId?: string | undefined;
  threadId: string;
  trail: ThinkingStep[];
  trailElapsedMs: number;
  artifactRef?: string | undefined;
  timestamp: number;
}

interface SessionState {
  turns: Turn[];
  // Which thread the transcript currently shows — the single source of
  // truth for "what's the active investigation," replacing the earlier
  // isLandingOverride flag entirely: null means "show the blank landing
  // composer," any other value means "show that thread's turns." Set
  // explicitly by submitQuery.ts/presentScene.ts when a turn starts (skipped
  // for Monitor-module pushes — see presentScene.ts's own comment, same
  // "don't steal focus" law openArtifactSilently already follows) and by
  // artifactStore.setOpenArtifact whenever an artifact is deliberately
  // opened (a Sidebar/Investigations/Market Pulse row is "go view this
  // investigation," so the artifact and the thread move together by
  // construction, not by every call site remembering to pair two calls —
  // the exact "two stores drift" bug class Phase 8B WO-1's own root cause
  // already was).
  activeThreadId: string | null;
  // Returns the resolved threadId so the caller can decide whether/when
  // to make it active (presentScene.ts skips this for alerts).
  addTurn: (turn: Omit<Turn, "threadId">) => string;
  settleTurn: (
    id: string,
    settled: { trail: ThinkingStep[]; trailElapsedMs: number; artifactRef: string },
  ) => void;
  setActiveThread: (threadId: string | null) => void;
  // "New investigation" — clears turns only, same as before threading.
  // Frame's hasStarted (activeThreadId !== null, cleared here too) is
  // what actually returns the shell to LandingState.
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  turns: [],
  activeThreadId: null,
  // Investigation threading (architect-ordered) — the exact rule, stated
  // once here rather than re-derived per entry point: a newly resolved
  // turn joins the MOST RECENT existing turn's thread whose own resolved
  // scene shares the same scene family (sceneFamily(), the same function
  // ArtifactStack already uses for version numbering — no second lineage
  // concept). If no existing turn shares that family, a new thread is
  // minted. This is a global scan across every turn regardless of thread,
  // applied uniformly no matter how the turn was triggered (typed query,
  // refine, entity-link, Market Pulse click, or a pushed alert) — the
  // order's own "do not invent a second lineage concept" ruled out
  // scoping this to "only the currently active thread." An unresolved
  // turn (no sceneId — nothing matched) always starts its own thread;
  // there is no family to compare.
  //
  // Only one trail plays at a time (trailPlayer's own generation counter),
  // so submitting a new query while a previous one is still resolved-but-
  // unsettled (status "resolved", no artifactRef yet — trailPlayer.ts's
  // isCurrent() guard means that old turn's settleTurn will now never
  // fire) permanently orphans it. Left as "resolved" it would satisfy
  // every "isThinking"/"pulsing" check forever, alongside the genuinely
  // active new turn. Marking it "interrupted" here, the one place a turn
  // can be superseded, keeps every consumer honest without each one
  // re-deriving "is this actually still in flight."
  addTurn: (turn) => {
    const family = turn.sceneId ? sceneFamily(turn.sceneId) : null;
    const matched = family
      ? [...get().turns].reverse().find((existing) => existing.sceneId && sceneFamily(existing.sceneId) === family)
      : undefined;
    const threadId = matched?.threadId ?? crypto.randomUUID();

    set((state) => ({
      turns: [
        ...state.turns.map((existing) =>
          existing.status === "resolved" && !existing.artifactRef
            ? { ...existing, status: "interrupted" as const }
            : existing,
        ),
        { ...turn, threadId },
      ],
    }));
    return threadId;
  },
  settleTurn: (id, settled) =>
    set((state) => ({
      turns: state.turns.map((turn) => (turn.id === id ? { ...turn, ...settled } : turn)),
    })),
  setActiveThread: (threadId) => set({ activeThreadId: threadId }),
  reset: () => set({ turns: [], activeThreadId: null }),
}));
