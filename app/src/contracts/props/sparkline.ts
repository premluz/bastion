import { z } from "zod";

// Not a bind node: sparkline is deliberately minimal — a bare points
// array, not a full SeriesDataSet, since it carries no axes/legend/tooltip
// (node-vocabulary.md: "no axes, one hue") and is meant for inline use
// (in metric and data-table cells) where a full DataSet's ceremony would
// be wrong. Authored directly, same register as metric/status-tag's
// literal props per the Phase 3 binding-mapping ruling.
export const SparklinePropsSchema = z.object({
  points: z.array(z.object({ x: z.string().min(1), y: z.number() })),
});
export type SparklineProps = z.infer<typeof SparklinePropsSchema>;
