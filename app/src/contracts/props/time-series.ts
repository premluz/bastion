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
// statStrip (Phase 12 WO-2): additive prop only, no new node type — each
// entry renders through the existing Metric component directly (same
// reuse precedent as Metric importing Sparkline, EntityHeader importing
// StatusTag). Capped at 4, matching metric-grid's own "2-4, one gestalt
// read" vocabulary law.
const StatStripEntrySchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]),
  detail: z.string().min(1).optional(),
});

export const TimeSeriesPropsSchema = z.object({
  title: z.string().min(1).optional(),
  variant: z.enum(["line", "combo"]).optional(),
  referenceLines: z.array(z.object({ value: z.number(), label: z.string().min(1).optional() })).optional(),
  annotations: z.array(z.object({ x: z.string().min(1), label: z.string().min(1) })).optional(),
  statStrip: z.array(StatStripEntrySchema).max(4).optional(),
  // Phase 16 revision: additive prop only, no new node type — names one
  // series (by its own `id`) to render against a second, right-side
  // Y-axis instead of sharing the primary's scale. For a genuinely
  // second-unit dimension (volatility % alongside yield %, volume
  // alongside price) — not decorative, the two lines are real different
  // measures. Absent, behavior is unchanged (single shared axis, as
  // every existing fixture already renders).
  rightAxisSeriesId: z.string().min(1).optional(),
  // Phase 21 addendum: additive prop only, no new node type. Every existing
  // usage keeps the default chart margins and outside-axis tick placement
  // (unchanged, default false) — TrendChart alone opts in for its full-bleed,
  // inner-axis presentation inside its own Panel.
  bleed: z.boolean().optional(),
  // 2026-09-01 addendum: additive, default undefined (falls back to
  // bleed's own hardcoded 320px) — overrides the bleed-mode chart height
  // for a caller that needs a shorter bleed chart than Entity Detail's
  // own 320px (AssetTrendCard.tsx's own peer-comparison tile, "30% less
  // height of current"), without touching the 320px default every other
  // bleed usage (Entity Detail's real price chart) still relies on.
  // Meaningless when bleed is false/omitted — ResponsiveContainer's own
  // non-bleed height stays the existing hardcoded 200px regardless.
  bleedHeight: z.number().positive().optional(),
  // 2026-08-17 follow-up: additive, default false — every existing scene
  // usage of this node keeps its current plain rendering. time-series is
  // a generic, scene-driven bind node with no inherent trend direction
  // (unlike TrendChart, a TradableAsset-specific literal-prop node with a
  // real single up/down to key its own glow off of), so this always uses
  // the theme's own --accent-signal, never --delta-up/--delta-down.
  glow: z.boolean().optional(),
  // 2026-08-22 addendum: additive, default false — the Y-axis's bleed-mode
  // domain (ChartBleedAxes) is hardcoded to [0, 'auto'], correct for a
  // long daily history where the actual price band is a small fraction of
  // the 0-baseline range, but wrong for a short/tight window (e.g.
  // TrendChart's own intraday 1H/24H periods) where anchoring at 0
  // visually compresses real movement into a flat-looking line near the
  // axis top. true switches the domain to ['auto', 'auto'] (recharts'
  // own real min/max of the plotted data) instead. Every existing usage
  // keeps the current [0, 'auto'] behavior unchanged.
  yAutoScale: z.boolean().optional(),
  data: SeriesDataSetSchema.refine((d) => d.series.length <= 3, {
    message: "time-series supports at most 3 series lines",
  }),
});
export type TimeSeriesProps = z.infer<typeof TimeSeriesPropsSchema>;
