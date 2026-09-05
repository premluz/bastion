import { z } from "zod";

// Responsive form (2026-09-01, direct feedback: "charts should stack on
// mobile if not room, check other responsive layouts in this context") —
// mirrors Astryx's own GridColumns union (Grid.d.ts: `number | {minWidth,
// max?, repeat?}`), the same shape DashboardLayoutProps.columns already
// widened to (config.ts's assetCardGrid, "repeat: 'fit' is what lets
// tracks actually COLLAPSE to fewer columns instead of just shrinking
// every card equally"). scene-grid is the one container node authorable
// from scene JSON with per-child spanning absent, so unlike
// dashboard-layout (columns deliberately NOT scene-authorable, Phase 12
// WO-1.5 ruling), a scene genuinely needs to request this responsive
// form itself — e.g. a peer-comparison row of 3 charts that must stack
// under a narrow artifact pane.
const SceneGridColumnsSchema = z.union([
  z.number().int().min(1).max(6),
  z.object({
    minWidth: z.number().int().positive(),
    max: z.number().int().min(1).max(6).optional(),
    repeat: z.enum(["fill", "fit"]).optional(),
  }),
]);

// scene-grid is the stage, not a decision — its only authored knob is how
// many columns the grid offers; content and order come from the scene tree.
export const SceneGridPropsSchema = z.object({
  columns: SceneGridColumnsSchema.optional(),
});
export type SceneGridProps = z.infer<typeof SceneGridPropsSchema>;
