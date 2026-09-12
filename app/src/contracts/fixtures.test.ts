import { describe, expect, it } from "vitest";
import { HydratedSceneSchema, SceneSchema } from "./scene";
import { hydrateScene, loadSceneFixtures, loadUniverse } from "./testSupport";

const universe = loadUniverse();
const fixtures = loadSceneFixtures();

// Bastion fork note: Merlin's own fixture scenes were deleted per the fork
// spec's "prune, don't adapt" rule for universe/scene content (see
// scenes/manifest.json and CLAUDE.md §10) — authoring Bastion's own is
// explicit Phase 1 work, out of scope for this pass. Zero fixtures is the
// correct, expected state until then; the per-fixture suites below simply
// run over an empty list rather than failing on an assumption that no
// longer holds.
describe("scene fixtures", () => {
  it("has no fixtures yet (expected until Bastion's own Phase 1 authors some)", () => {
    expect(fixtures.length).toBe(0);
  });

  for (const { file, raw } of fixtures) {
    it(`${file} parses as a valid Scene`, () => {
      const result = SceneSchema.safeParse(raw);
      expect(result.success ? undefined : result.error.issues).toBeUndefined();
    });
  }

  for (const { file, raw } of fixtures) {
    it(`${file}: every $ref resolves against the universe`, () => {
      const scene = SceneSchema.parse(raw);
      for (const [key, entry] of Object.entries(scene.data)) {
        if ("$ref" in entry) {
          expect(universe[entry.$ref], `data["${key}"] refs missing universe key "${entry.$ref}"`).toBeDefined();
        }
      }
    });
  }

  for (const { file, raw } of fixtures) {
    it(`${file}: hydrates into a standalone-valid HydratedScene`, () => {
      const scene = SceneSchema.parse(raw);
      const hydrated = hydrateScene(scene, universe);
      const result = HydratedSceneSchema.safeParse(hydrated);
      expect(result.success ? undefined : result.error.issues).toBeUndefined();
    });
  }
});
