import type { HydratedScene } from "../../contracts/scene";

// Strategy interface (CLAUDE.md §3): implementation #1 is keywordResolver
// (manifest keyword index). Nothing above this resolves which
// implementation is active — a future Anthropic-API resolver (Phase 9)
// implements the same interface. null means no scene matched — an honest
// non-match, never a throw.
export interface IntentResolver {
  resolve(query: string): Promise<HydratedScene | null>;
}
