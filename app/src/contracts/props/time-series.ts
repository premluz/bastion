import { z } from "zod";
import { SeriesDataSetSchema } from "../data";

// Bind node: data resolves against a SeriesDataSet via `bind`. Vocabulary
// caps series at 3 lines — enforced here so a malformed scene fails loud
// rather than rendering a cluttered chart. Phase 8E craft additions:
// variant switches to a combo (bars + line) read for the primary series;
// referenceLines are horizontal thresholds, annotations are vertical
// event markers (e.g. the two settlement-anomaly failure dates) — kept
// as two distinct, narrowly-typed shapes rather than one generic
// "marker" union, since the vocabulary's registers treat a threshold and
// a named event differently (a threshold is context, an event is a fact).
export const TimeSeriesPropsSchema = z.object({
  title: z.string().min(1).optional(),
  variant: z.enum(["line", "combo"]).optional(),
  referenceLines: z.array(z.object({ value: z.number(), label: z.string().min(1).optional() })).optional(),
  annotations: z.array(z.object({ x: z.string().min(1), label: z.string().min(1) })).optional(),
  data: SeriesDataSetSchema.refine((d) => d.series.length <= 3, {
    message: "time-series supports at most 3 series lines",
  }),
});
export type TimeSeriesProps = z.infer<typeof TimeSeriesPropsSchema>;
