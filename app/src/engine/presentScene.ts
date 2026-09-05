import type { HydratedScene } from "../contracts/scene";
import type { SceneMount } from "./resolver/types";
import { useSessionStore } from "./stores/sessionStore";
import { useArtifactStore } from "./stores/artifactStore";
import { useTrailStore } from "./stores/trailStore";
import { playTrail } from "./trailPlayer";
import { getModuleForScene } from "./sceneModule";
import { getAlertSubjectEntity } from "./alertSubjectEntity";
import { useWatchlistStore } from "./stores/watchlistStore";
import { config } from "../config";
import { mockSearchResultsFor } from "./mockSearchResults";

// Shared by submitQuery.ts (typed queries, after the resolver succeeds)
// and liveChannel.ts (Phase 9 MCP push — a scene that arrives already
// hydrated, no resolver step at all): add the turn, play its trail, then
// either promote to the artifact stack or mount inline in the turn's own
// transcript entry, depending on `mount` (Phase 21, 2026-08-30 — CLAUDE.md
// §3's own inline-mount law). Phase 8B WO-1's turn/artifact model + WO-3's
// autoOpen config apply unchanged to the artifact path.
//
// mount defaults to "artifact" (the original, only path before this
// phase) — liveChannel.ts's MCP push never passes it: a pushed scene has
// no manifest entry to read a mount decision from (mount lives on the
// scene's manifest entry, not the Scene contract itself — see
// resolver/types.ts's own comment), so it always promotes to the
// artifact stack, exactly as before this phase. Giving push_scene its own
// inline path is real, unscoped future work if ordered, not assumed here.
export function presentScene(utterance: string, scene: HydratedScene, mount: SceneMount = "artifact"): void {
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

  // Mock web-search results (direct order, 2026-08-10): populated only on
  // search-kind steps that don't already carry real webResults, so a
  // scene authoring its own per-scenario results later is respected
  // automatically — see mockSearchResults.ts's own comment. Mapped once,
  // reused for both the live play and the persisted trail below, so a
  // re-viewed settled turn still shows the results card, not just the
  // live play.
  const thinkingWithMocks = scene.thinking.map((step) =>
    step.kind === "search" && !step.webResults ? { ...step, webResults: mockSearchResultsFor(step.kind) } : step,
  );

  playTrail(thinkingWithMocks, () => {
    // INLINE (Phase 21): settle directly with the hydrated scene, never
    // touching the artifact store at all — no registerArtifact, no
    // setOpenArtifact, no watchlist auto-append (an inline result is a
    // single-entity-facet or browse-shaped answer, never a Monitor alert
    // by construction — see CLAUDE.md §3's own three-way routing split).
    // Transcript.tsx reads turn.inlineScene and mounts SceneRenderer
    // directly at that point.
    if (mount === "inline") {
      useSessionStore.getState().settleTurn(turnId, {
        trail: thinkingWithMocks,
        trailElapsedMs: useTrailStore.getState().elapsedMs,
        inlineScene: scene,
      });
      return;
    }

    const artifactId = crypto.randomUUID();
    useArtifactStore.getState().registerArtifact(artifactId, { scene, module: getModuleForScene(scene.id) });
    useSessionStore.getState().settleTurn(turnId, {
      trail: thinkingWithMocks,
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
