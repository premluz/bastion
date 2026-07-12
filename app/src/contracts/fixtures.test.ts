import { describe, expect, it } from "vitest";
import { HydratedSceneSchema, SceneSchema } from "./scene";
import { hydrateScene, loadSceneFixtures, loadUniverse } from "./testSupport";

const universe = loadUniverse();
const fixtures = loadSceneFixtures();

describe("scene fixtures", () => {
  it("found fixtures to test", () => {
    expect(fixtures.length).toBeGreaterThan(0);
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
