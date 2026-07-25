import { HydratedSceneSchema } from "../contracts/scene";
import { presentScene } from "./presentScene";
import { config } from "../config";
import { useArtifactStore } from "./stores/artifactStore";

// Phase 9: subscribes to mcp-server's SSE broadcast. A pushed scene enters
// the transcript exactly like a typed query (presentScene.ts), except the
// utterance slot reads as an alert rather than a question — there was no
// question, an external agent pushed this unprompted.
//
// Update-in-place path (2026-07-25), additive, gated strictly on id match:
// if the pushed scene's id equals the scene already sitting in the
// CURRENTLY OPEN artifact, this is a live revision of what's already on
// screen (e.g. the risk desk dashboard's numbers moving) — patch that
// artifact's scene instead of registering a whole new turn. Any other id
// (including a first-ever push of this same scene, before it's ever been
// opened as an artifact) falls through to presentScene exactly as before
// — Phase 9's new-scene/alert behavior is unchanged.
export function connectLiveChannel(): () => void {
  const source = new EventSource(config.liveChannel.url);

  source.onmessage = (event) => {
    const payload: unknown = JSON.parse(event.data);
    const parsed = HydratedSceneSchema.safeParse(payload);
    if (!parsed.success) {
      // The server already validates against SceneSchema before
      // broadcasting (push_scene), so a failure here means the two
      // processes' contracts.ts copies have drifted — a real bug, not an
      // expected runtime case, so it's surfaced loudly rather than
      // swallowed.
      console.error("liveChannel: received a scene that failed HydratedSceneSchema", parsed.error);
      return;
    }
    const { openArtifactId, artifacts } = useArtifactStore.getState();
    const openScene = openArtifactId ? artifacts[openArtifactId]?.scene : undefined;
    if (openScene && openScene.id === parsed.data.id) {
      useArtifactStore.getState().patchOpenArtifactScene(parsed.data);
      return;
    }
    presentScene(`Alert — ${parsed.data.title}`, parsed.data);
  };

  source.onerror = (event) => {
    console.error("liveChannel: SSE connection error", event);
  };

  return () => source.close();
}
