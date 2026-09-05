import type { HydratedScene } from "../../contracts/scene";

// Where a resolved scene's SceneRenderer output mounts (Phase 21,
// 2026-08-30, CLAUDE.md §3's own inline-mount law) — 'artifact' is the
// original, still-default path (promoted to the artifact stack);
// 'inline' renders directly inside the turn's own transcript entry. Lives
// on the RESOLUTION result, not the Scene contract itself, since the
// decision is read from the scene's manifest entry (mount?: 'inline' |
// 'artifact', scenes/manifest.json) — the same place `module` already
// lives as per-scene metadata outside the Scene shape.
export type SceneMount = "inline" | "artifact";

export interface ResolvedScene {
  scene: HydratedScene;
  mount: SceneMount;
}

// Strategy interface (CLAUDE.md §3): implementation #1 is keywordResolver
// (manifest keyword index). Nothing above this resolves which
// implementation is active — a future Anthropic-API resolver (Phase 9)
// implements the same interface. null means no scene matched — an honest
// non-match, never a throw.
export interface IntentResolver {
  resolve(query: string): Promise<ResolvedScene | null>;
}
