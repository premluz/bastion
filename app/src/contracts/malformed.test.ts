import { describe, expect, it } from "vitest";
import { HydratedSceneSchema, SceneSchema } from "./scene";
import { hydrateScene } from "./testSupport";

const planStep = {
  id: "step-1",
  kind: "plan" as const,
  label: "Planning",
  durationMs: 800,
};

const baseValidScene = {
  id: "malformed-base",
  title: "Malformed Base",
  intents: ["test"],
  thinking: [planStep],
  data: {},
  layout: { id: "root", type: "scene-grid" },
};

describe("malformed scene corpus — fails with useful errors", () => {
  it("sanity check: the base fixture itself is valid", () => {
    expect(SceneSchema.safeParse(baseValidScene).success).toBe(true);
  });

  it("rejects a scene missing id", () => {
    const { id: _id, ...withoutId } = baseValidScene;
    const result = SceneSchema.safeParse(withoutId);
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues.some((i) => i.path.join(".") === "id")).toBe(true);
  });

  it("rejects a node with a negative reveal index", () => {
    const scene = { ...baseValidScene, layout: { ...baseValidScene.layout, reveal: -1 } };
    expect(SceneSchema.safeParse(scene).success).toBe(false);
  });

  it("rejects a DataSet with an unregistered kind", () => {
    const scene = { ...baseValidScene, data: { chart: { kind: "chart", values: [1, 2, 3] } } };
    expect(SceneSchema.safeParse(scene).success).toBe(false);
  });

  it("rejects a confidence value outside 0..1", () => {
    const scene = {
      ...baseValidScene,
      thinking: [{ ...planStep, kind: "synthesize" as const, confidence: 1.5 }],
    };
    expect(SceneSchema.safeParse(scene).success).toBe(false);
  });

  it("rejects an empty title", () => {
    const scene = { ...baseValidScene, title: "" };
    expect(SceneSchema.safeParse(scene).success).toBe(false);
  });

  it("rejects a scene missing layout", () => {
    const { layout: _layout, ...withoutLayout } = baseValidScene;
    expect(SceneSchema.safeParse(withoutLayout).success).toBe(false);
  });
});

describe("dangling $ref — hydrates to a MissingDataSet, not a crash", () => {
  it("resolves a dangling ref without throwing, marked missing", () => {
    const scene = SceneSchema.parse({
      ...baseValidScene,
      id: "dangling-ref-scene",
      data: { orphan: { $ref: "does-not-exist-in-universe" } },
    });

    let hydrated;
    expect(() => {
      hydrated = hydrateScene(scene, {});
    }).not.toThrow();

    expect(hydrated!.data.orphan).toEqual({
      kind: "missing",
      ref: "does-not-exist-in-universe",
      reason: "ref did not resolve to a valid DataSet in the universe",
    });

    expect(HydratedSceneSchema.safeParse(hydrated).success).toBe(true);
  });
});
