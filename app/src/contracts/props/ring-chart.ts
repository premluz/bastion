import { z } from "zod";
import { TableDataSetSchema } from "../data";

// Bound node, same labelColumn/valueColumn binding shape as
// concentration-map (deliberate reuse, not a new DataSet shape).
// Capped at 6 rows, matching the --viz palette (accent-signal + viz-2
// through viz-6) — same "fail loud, don't render clutter" rationale as
// bar-series' own 3-series cap.
export const RingChartPropsSchema = z.object({
  title: z.string().min(1).optional(),
  labelColumn: z.string().min(1),
  valueColumn: z.string().min(1),
  valueSuffix: z.string().min(1).optional(),
  data: TableDataSetSchema.refine((d) => d.rows.length <= 6, {
    message: "ring-chart supports at most 6 segments",
  }),
});
export type RingChartProps = z.infer<typeof RingChartPropsSchema>;
