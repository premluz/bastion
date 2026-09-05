import { z } from "zod";

// New registry node (node-vocabulary.md, Phase 20) — extends time-series
// in spirit, not in schema: time-series is a BIND node (data resolves via
// scene `bind`); TrendChart is a literal-prop node (TradableAsset's own
// trendChart is consumed directly, no scene/bind involved, same static-
// page posture as Holdings/EntityDetailPage). Owns period-toggle UI state
// internally, then delegates actual chart rendering to time-series by
// constructing a SeriesDataSet payload — composition, not duplication.
const TrendPeriodSchema = z.enum(["1H", "24H", "7D", "1M", "YTD", "1Y", "MAX"]);

const TrendPointSchema = z.object({
  t: z.string().min(1),
  price: z.number(),
});

const CompareSeriesSchema = z.object({
  label: z.string().min(1),
  series: z.array(TrendPointSchema),
});

export const TrendChartPropsSchema = z.object({
  title: z.string().min(1).optional(),
  series: z.array(TrendPointSchema).min(1),
  // intraday/intradayFine (2026-08-22): optional denser arrays for
  // 24H/1H respectively — see tradableAsset.ts's TrendChartSchema, this
  // mirrors it exactly.
  intraday: z.array(TrendPointSchema).optional(),
  intradayFine: z.array(TrendPointSchema).optional(),
  periods: z.array(TrendPeriodSchema).min(1),
  compareSeries: z.array(CompareSeriesSchema).optional(),
  // Suppresses the header row (title + period SegmentedControl) entirely
  // (2026-09-01, direct order: "3 charts... 7d timeframe but no timeframe
  // selector" for a peer-comparison row) — distinct from the existing
  // controlled-mode suppression (activePeriod+onPeriodChange), which
  // needs a function prop scene JSON can never carry. A real Zod
  // boolean, so a scene-bound usage (this node's only path today, per
  // registry.ts) can request it. false/omitted (every existing usage)
  // renders the header exactly as before.
  hidePeriodSelector: z.boolean().optional(),
  // Passed straight through to time-series's own bleedHeight (2026-09-01,
  // direct order: "30% less height of current" for AssetTrendCard.tsx's
  // peer-comparison tile) — Entity Detail's own real price chart omits
  // this and keeps time-series's existing 320px bleed default.
  bleedHeight: z.number().positive().optional(),
});
export type TrendChartProps = z.infer<typeof TrendChartPropsSchema>;
