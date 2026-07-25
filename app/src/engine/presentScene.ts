import type { HydratedScene } from "../contracts/scene";
import { useSessionStore } from "./stores/sessionStore";
import { useArtifactStore } from "./stores/artifactStore";
import { useTrailStore } from "./stores/trailStore";
import { playTrail } from "./trailPlayer";
import { getModuleForScene } from "./sceneModule";
import { getAlertSubjectEntity } from "./alertSubjectEntity";
import { useWatchlistStore } from "./stores/watchlistStore";
import { config } from "../config";

// Shared by submitQuery.ts (typed queries, after the resolver succeeds)
// and liveChannel.ts (Phase 9 MCP push — a scene that arrives already
// hydrated, no resolver step at all): add the turn, play its trail, then
// register + settle the artifact exactly the same way regardless of how
// the scene got here. Phase 8B WO-1's turn/artifact model + WO-3's
// autoOpen config apply identically to both entry points.
export function presentScene(utterance: string, scene: HydratedScene): void {
  const turnId = crypto.randomUUID();
  const isAlert = getModuleForScene(scene.id) === "monitor";

  const threadId = useSessionStore.getState().addTurn({
    id: turnId,
    utterance,
    status: "resolved",
    sceneTitle: scene.title,
    sceneId: scene.id,
    trail: [],
    trailElapsedMs: 0,
    timestamp: Date.now(),
  });
  // Investigation threading order: every non-alert turn becomes the
  // active thread immediately — before the trail even plays, so the
  // transcript shows the live-thinking turn right away, same as it did
  // pre-threading. Alerts skip this: a push landing while the user is
  // elsewhere must not yank their transcript over to it, the same "don't
  // steal focus" law openArtifactSilently already follows below. addTurn
  // itself decides whether this joins an existing thread (matching scene
  // family) or starts a new one — that rule lives in exactly one place,
  // not re-derived here.
  if (!isAlert) useSessionStore.getState().setActiveThread(threadId);

  playTrail(scene.thinking, () => {
    const artifactId = crypto.randomUUID();
    useArtifactStore.getState().registerArtifact(artifactId, { scene, module: getModuleForScene(scene.id) });
    useSessionStore.getState().settleTurn(turnId, {
      trail: scene.thinking,
      trailElapsedMs: useTrailStore.getState().elapsedMs,
      artifactRef: artifactId,
    });
    // setOpenArtifact syncs sceneStore.activeScene itself (artifactStore.ts,
    // Phase 8H) — one call does both. A Monitor-module autoOpen uses the
    // silent variant instead: the content still appears immediately, but
    // doesn't mark itself "seen" — a push landing while the user is on a
    // different page shouldn't clear NotificationBell's badge before they
    // ever looked. Every other autoOpen (a typed query, an Investigate
    // action) is real, deliberate human intent and marks viewed normally.
    if (config.artifacts.autoOpen) {
      if (isAlert) {
        useArtifactStore.getState().openArtifactSilently(artifactId);
      } else {
        useArtifactStore.getState().setOpenArtifact(artifactId);
      }
    }
    // Watchlist auto-append (Phase 8G WO-2): a Monitor-module turn tracks
    // its own subject automatically, the same "alert turns append" law
    // that governs Sidebar's Monitor group — no reason to require a
    // manual Watch click for something that already pushed itself into
    // view unprompted. Idempotent via watchlistStore's own keyed-by-id
    // guard, so a second alert for an already-watched entity is a no-op.
    if (isAlert) {
      const subject = getAlertSubjectEntity(scene);
      if (subject) useWatchlistStore.getState().watch(subject.entityId, subject.label, "alert");
    }
  });
}
