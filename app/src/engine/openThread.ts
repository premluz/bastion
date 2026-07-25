import type { ThreadSummary } from "./threads";
import { useArtifactStore } from "./stores/artifactStore";
import { useSessionStore } from "./stores/sessionStore";

// Shared by every "reopen an investigation" row (Sidebar's Recent,
// InvestigationsPage) — not by Market Pulse's own already-investigated
// click, which deliberately stays put rather than navigating (an earlier,
// separate ruling: the artifact stack is global, so a page navigation
// isn't needed there) and already gets correct thread-switching for free
// from artifactStore.setOpenArtifact's own centralization.
//
// If the thread's latest turn has settled, setOpenArtifact does double
// duty (also syncs sessionStore.activeThreadId, per its own comment). If
// it's still thinking or never resolved, there's no artifact to open
// yet, so the thread is switched directly. Callers still own page
// navigation themselves (setPage('home')) — this only handles which
// thread/artifact becomes current.
export function reopenThread(thread: ThreadSummary): void {
  if (thread.latestTurn.artifactRef) {
    useArtifactStore.getState().setOpenArtifact(thread.latestTurn.artifactRef);
  } else {
    useSessionStore.getState().setActiveThread(thread.threadId);
  }
}
