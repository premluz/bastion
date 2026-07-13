import type { IntentResolver } from "./resolver/types";
import { useSessionStore } from "./stores/sessionStore";
import { cancelTrail } from "./trailPlayer";
import { presentScene } from "./presentScene";

// Query → resolve → trail plays → scene assembles as the trail's final
// step completes (node-vocabulary.md Trail section choreography). Kept
// out of ChatBar so the component stays presentational and this
// orchestration is testable independent of any rendering.
//
// The turn/artifact/trail choreography past "resolve" is shared with
// liveChannel.ts's MCP-pushed scenes (Phase 9) — see presentScene.ts.
export async function submitQuery(query: string, resolver: IntentResolver): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;

  const scene = await resolver.resolve(trimmed);

  if (!scene) {
    useSessionStore.getState().addTurn({
      id: crypto.randomUUID(),
      utterance: trimmed,
      status: "unresolved",
      trail: [],
      trailElapsedMs: 0,
      timestamp: Date.now(),
    });
    // An unresolved turn changes nothing about which artifact is open —
    // the old single-slot architecture nulled sceneStore.activeScene
    // here, which was correct when Canvas was the only source of truth.
    // Now that Canvas only mounts inside the artifact stack (driven by
    // artifactStore.openArtifactId, untouched by this branch), nulling
    // activeScene here would desync it from a still-open panel — Canvas
    // would show "No scene yet" while the panel's own chrome kept
    // showing the last real artifact's title. Found writing WO-2's gate
    // test, not by inspection; see STATE.md.
    cancelTrail();
    return;
  }

  presentScene(trimmed, scene);
}
