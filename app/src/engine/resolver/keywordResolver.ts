import type { IntentResolver } from "./types";
import { SceneSchema } from "../../contracts/scene";
import { hydrateScene, loadUniverse } from "../../contracts/hydrate";
import manifestJson from "../../../scenes/manifest.json";

interface ManifestEntry {
  id: string;
  file: string;
  module: string;
  intents: string[];
}

const sceneModules = import.meta.glob<unknown>("../../../scenes/*.scene.json", {
  eager: true,
  import: "default",
});

const sceneRawByFile = new Map(
  Object.entries(sceneModules).map(([path, raw]) => [path.split("/").pop() ?? path, raw]),
);

// Fuzzy-lite scoring: lowercase, trim, token overlap — nothing more
// sophisticated by design (merlin-scene-authoring's intents are already
// authored with canonical phrase + variants + keyword fragments, so
// overlap against that richer set does the matching work).
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function overlapScore(queryTokens: string[], intentTokens: string[]): number {
  if (queryTokens.length === 0) return 0;
  const intentSet = new Set(intentTokens);
  const shared = queryTokens.filter((token) => intentSet.has(token)).length;
  return shared / queryTokens.length;
}

// At least half the query's tokens must land in a single intent phrase to
// count as a match — loose enough for natural phrasing, tight enough that
// one stray shared word doesn't resolve an unrelated scene.
const MATCH_THRESHOLD = 0.5;

export function createKeywordResolver(): IntentResolver {
  const universe = loadUniverse();
  const entries = (manifestJson as { scenes: ManifestEntry[] }).scenes;

  return {
    async resolve(query: string) {
      const queryTokens = tokenize(query);
      let best: { entry: ManifestEntry; score: number } | undefined;

      for (const entry of entries) {
        const score = Math.max(...entry.intents.map((intent) => overlapScore(queryTokens, tokenize(intent))));
        if (!best || score > best.score) {
          best = { entry, score };
        }
      }

      if (!best || best.score < MATCH_THRESHOLD) {
        return null;
      }

      const raw = sceneRawByFile.get(best.entry.file);
      const scene = SceneSchema.parse(raw);
      return hydrateScene(scene, universe);
    },
  };
}
