import { z } from "zod";
import { DataSetSchema, UniverseRefSchema } from "./data.ts";
import { ThinkingStepSchema } from "./thinking.ts";

// propName -> data key, resolved by the renderer against scene.data.
export const DataBindingSchema = z.record(z.string(), z.string());
export type DataBinding = z.infer<typeof DataBindingSchema>;

export interface SceneNode {
  id: string;
  type: string;
  props?: Record<string, unknown> | undefined;
  bind?: DataBinding | undefined;
  children?: SceneNode[] | undefined;
  reveal?: number | undefined;
}

// Recursive schema: TS can't infer through z.lazy, so the interface
// above is authored by hand and z.ZodType<SceneNode> pins the schema
// to it.
export const SceneNodeSchema: z.ZodType<SceneNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.record(z.string(), z.unknown()).optional(),
    bind: DataBindingSchema.optional(),
    children: z.array(SceneNodeSchema).optional(),
    reveal: z.number().int().nonnegative().optional(),
  }),
);

// Before hydration, a data entry is either an inline DataSet or an
// unresolved reference into universe/*.json.
export const SceneDataEntrySchema = z.union([DataSetSchema, UniverseRefSchema]);
export type SceneDataEntry = z.infer<typeof SceneDataEntrySchema>;

const sceneShape = {
  id: z.string().min(1),
  title: z.string().min(1),
  intents: z.array(z.string().min(1)),
  thinking: z.array(ThinkingStepSchema),
  layout: SceneNodeSchema,
};

// As authored in scenes/*.scene.json or pushed over MCP — data entries
// may still be unresolved UniverseRefs.
export const SceneSchema = z.object({
  ...sceneShape,
  data: z.record(z.string(), SceneDataEntrySchema),
});
export type Scene = z.infer<typeof SceneSchema>;

// As produced by the resolver — every $ref has been hydrated into a
// DataSet (or a MissingDataSet marker for a dangling ref). Renderer
// and registry only ever see this shape (CLAUDE.md §6).
export const HydratedSceneSchema = z.object({
  ...sceneShape,
  data: z.record(z.string(), DataSetSchema),
});
export type HydratedScene = z.infer<typeof HydratedSceneSchema>;
