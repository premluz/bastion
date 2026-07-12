import { z } from "zod";

// scene-grid is the stage, not a decision — its only authored knob is how
// many columns the grid offers; content and order come from the scene tree.
export const SceneGridPropsSchema = z.object({
  columns: z.number().int().min(1).max(6).optional(),
});
export type SceneGridProps = z.infer<typeof SceneGridPropsSchema>;
