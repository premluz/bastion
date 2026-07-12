import { HydratedSceneSchema } from "../contracts/scene";
import { presentScene } from "./presentScene";
import { config } from "../config";

// Phase 9: subscribes to mcp-server's SSE broadcast. A pushed scene enters
// the transcript exactly like a typed query (presentScene.ts), except the
// utterance slot reads as an alert rather than a question — there was no
// question, an external agent pushed this unprompted.
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
    presentScene(`Alert — ${parsed.data.title}`, parsed.data);
  };

  source.onerror = (event) => {
    console.error("liveChannel: SSE connection error", event);
  };

  return () => source.close();
}
