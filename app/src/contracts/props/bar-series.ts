import { z } from "zod";
import { SeriesDataSetSchema } from "../data";

// Bind node: reuses the series DataSet (x is a category or period label,
// not necessarily a date — same shape, same precedent as time-series).
// Vocabulary caps at 3 series (grouped bars), same rationale as
// time-series: a malformed scene should fail loud, not render clutter.
export const BarSeriesPropsSchema = z.object({
  title: z.string().min(1).optional(),
  valueSuffix: z.string().min(1).optional(),
  data: SeriesDataSetSchema.refine((d) => d.series.length <= 3, {
    message: "bar-series supports at most 3 series",
  }),
});
export type BarSeriesProps = z.infer<typeof BarSeriesPropsSchema>;
