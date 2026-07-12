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
});
export type MetricProps = z.infer<typeof MetricPropsSchema>;
