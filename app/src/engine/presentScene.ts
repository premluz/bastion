import type { HydratedScene } from "../contracts/scene";
import { useSceneStore } from "./stores/sceneStore";
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

  useSessionStore.getState().addTurn({
    id: turnId,
    utterance,
    status: "resolved",
    sceneTitle: scene.title,
    trail: [],
    trailElapsedMs: 0,
    timestamp: Date.now(),
  });

  playTrail(scene.thinking, () => {
    const artifactId = crypto.randomUUID();
    useArtifactStore.getState().registerArtifact(artifactId, { scene, module: getModuleForScene(scene.id) });
    useSessionStore.getState().settleTurn(turnId, {
      trail: scene.thinking,
      trailElapsedMs: useTrailStore.getState().elapsedMs,
      artifactRef: artifactId,
    });
    if (config.artifacts.autoOpen) {
      useArtifactStore.getState().setOpenArtifact(artifactId);
      useSceneStore.getState().setActiveScene(scene);
    }
    // Watchlist auto-append (Phase 8G WO-2): a Monitor-module turn tracks
    // its own subject automatically, the same "alert turns append" law
    // that governs Sidebar's Monitor group — no reason to require a
    // manual Watch click for something that already pushed itself into
    // view unprompted. Idempotent via watchlistStore's own keyed-by-id
    // guard, so a second alert for an already-watched entity is a no-op.
    if (getModuleForScene(scene.id) === "monitor") {
      const subject = getAlertSubjectEntity(scene);
      if (subject) useWatchlistStore.getState().watch(subject.entityId, subject.label, "alert");
    }
  });
}
