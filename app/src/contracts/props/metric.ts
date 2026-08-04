import { z } from "zod";

// Literal-prop node: value/label are authored per scene, cross-checked by
// hand against bound data per the scene-authoring skill — no bind here.
// trend (Phase 8E) is an optional inline sparkline — same points shape as
// sparkline's own props, reused rather than duplicated.
export const MetricPropsSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]),
  unit: z.string().min(1).optional(),
  detail: z.string().min(1).optional(),
  trend: z.array(z.object({ x: z.string().min(1), y: z.number() })).optional(),
  // "compact" (2026-07-27, EntityDetailPage's About section — dense,
  // many-facts grids where display-3's full hero size doesn't fit six to
  // a row) — value renders smaller than the "default" (Trend/Statistics)
  // size. Label stays quiet either way (node-vocabulary.md's own
  // wording); only the numeral's prominence scales down.
  size: z.enum(["default", "compact"]).optional(),
});
export type MetricProps = z.infer<typeof MetricPropsSchema>;
