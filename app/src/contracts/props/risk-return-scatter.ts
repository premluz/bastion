import { z } from "zod";
import { ScatterDataSetSchema } from "../data";

// "How does this entity compare to its peers on two numeric axes at
// once?" (2026-09-01, direct order — a return-vs-volume peer scatter,
// reference: "7D Return ↑ / Volume →", one labeled point per entity).
// Distinct from bar-series/contribution-bars (one categorical axis) and
// from comparison (a table, no continuous geometry) — a genuinely new
// question, not a reskin. axisLabels are authored, never inferred from
// the data (same "labels are content, not derived" discipline the rest
// of this contract holds).
export const RiskReturnScatterPropsSchema = z.object({
  title: z.string().min(1).optional(),
  xAxisLabel: z.string().min(1),
  yAxisLabel: z.string().min(1),
  // Singles out one point (matched by ScatterDataSet point.entityId) in
  // --accent-signal; every other point renders in the shared peer hue.
  // Optional — a scatter with no distinguished subject just reads as a
  // flat peer set.
  subjectEntityId: z.string().min(1).optional(),
  data: ScatterDataSetSchema,
});
export type RiskReturnScatterProps = z.infer<typeof RiskReturnScatterPropsSchema>;
