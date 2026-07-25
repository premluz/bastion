import type { Turn } from "./stores/sessionStore";

export interface ThreadSummary {
  threadId: string;
  turns: Turn[]; // chronological, oldest first
  latestTurn: Turn;
  title: string; // latest resolved turn's sceneTitle, else the thread's first utterance
  timestamp: number; // latestTurn's own, for sort order
}

// Groups the flat turns array into one row per investigation thread
// (architect-ordered: "Left nav's Investigations/Recent list becomes the
// thread switcher: each row = one thread"). Shared by RecentSection.tsx
// and InvestigationsPage.tsx — the two surfaces the order names as "the
// thread switcher" — rather than each re-deriving the grouping.
export function buildThreads(turns: Turn[]): ThreadSummary[] {
  const byThread = new Map<string, Turn[]>();
  for (const turn of turns) {
    const list = byThread.get(turn.threadId);
    if (list) list.push(turn);
    else byThread.set(turn.threadId, [turn]);
  }

  const summaries: ThreadSummary[] = [];
  for (const [threadId, threadTurns] of byThread) {
    const chronological = [...threadTurns].sort((a, b) => a.timestamp - b.timestamp);
    const latestTurn = chronological[chronological.length - 1];
    if (!latestTurn) continue;
    const latestWithTitle = [...chronological].reverse().find((turn) => turn.sceneTitle);
    summaries.push({
      threadId,
      turns: chronological,
      latestTurn,
      title: latestWithTitle?.sceneTitle ?? chronological[0]!.utterance,
      timestamp: latestTurn.timestamp,
    });
  }

  return summaries.sort((a, b) => b.timestamp - a.timestamp);
}
