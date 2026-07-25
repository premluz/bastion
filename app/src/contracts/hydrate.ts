import { DataSetSchema, MissingDataSetSchema, type DataSet } from "./data";
import type { HydratedScene, Scene } from "./scene";
import entities from "../../universe/entities.json";
import datasets from "../../universe/datasets.json";
import news from "../../universe/news.json";

// The shared world: entities + reusable datasets + news coverage,
// flat-keyed (CLAUDE.md §6). news.json is TableDataSet-shaped per entry
// (Phase 16 revision) so the same authored content is a single source of
// truth for both a scene's own $ref binding and EntityDetailPage's direct
// read. Not sources.json — source systems are cited in ThinkingStep.sources
// as literal {name, ref} pairs, never $ref'd into scene.data.
export function loadUniverse(): Record<string, unknown> {
  return { ...entities, ...datasets, ...news };
}

// Stand-in for the Phase 5 resolver's hydration step: swaps every
// UniverseRef in scene.data for the DataSet it resolves to, or a
// MissingDataSet marker if the ref doesn't resolve to a valid one. Renderer
// and registry never see a bare UniverseRef, only this hydrated shape
// (CLAUDE.md §6) — used by both the contract tests and the Phase 4
// playground/fixture-render gate, since both need to turn raw Scene JSON
// into something SceneRenderer can consume.
export function hydrateScene(scene: Scene, universe: Record<string, unknown>): HydratedScene {
  const data: Record<string, DataSet> = {};
  for (const [key, entry] of Object.entries(scene.data)) {
    if ("$ref" in entry) {
      const parsed = DataSetSchema.safeParse(universe[entry.$ref]);
      data[key] = parsed.success
        ? parsed.data
        : MissingDataSetSchema.parse({
            kind: "missing",
            ref: entry.$ref,
            reason: "ref did not resolve to a valid DataSet in the universe",
          });
    } else {
      data[key] = entry;
    }
  }
  return { ...scene, data };
}
