import { z } from "zod";
import { ThinkingStepSourceSchema } from "./thinking";
import { AnalystConsensusSchema } from "./props/analyst-consensus";

// Phase 20 WO-1: replaces EntityDetail (engine/entityDetail.ts, Phase 16/
// 19). Equities, tokenized RWAs, and native crypto share this one shape —
// this platform's worldview treats an equity as a token representing a
// share, not a separate instrument class — differentiated by
// `assetClass` and a class-varying `keyStatsTable`, rather than three
// parallel schemas. Bonds are explicitly excluded: NordBond's field set
// (coupon, maturity, credit rating) doesn't overlap enough with the
// other three to force into this contract yet — it stays on the old
// EntityDetail shape until a later phase gives it its own contract.

export const AssetClassSchema = z.enum([
  "equity-token",
  "crypto-native",
  "tokenized-rwa",
]);
export type AssetClass = z.infer<typeof AssetClassSchema>;

// Reuses ThinkingStepSource (contracts/thinking.ts) — the same {name, ref}
// shape that renders as a SourceChip everywhere provenance is cited
// (trail, panel attributions, recommendations). AiRationale/
// PriceMovementTimeline entries are provenance citations, not a new kind
// of source — no second Source type invented.
const AssetSourceSchema = ThinkingStepSourceSchema;

const PriceHeaderSchema = z.object({
  lastPrice: z.number().positive(),
  changeAbs: z.number(),
  changePct: z.number(),
  asOf: z.string().min(1),
  afterHours: z
    .object({
      price: z.number().positive(),
      changeAbs: z.number(),
      changePct: z.number(),
      asOf: z.string().min(1),
    })
    .optional(),
  dayRange: z.tuple([z.number().positive(), z.number().positive()]),
});
export type PriceHeader = z.infer<typeof PriceHeaderSchema>;

const TrendPeriodSchema = z.enum(["1H", "24H", "7D", "1M", "YTD", "1Y", "MAX"]);
export type TrendPeriod = z.infer<typeof TrendPeriodSchema>;

const TrendPointSchema = z.object({
  t: z.string().min(1),
  price: z.number(),
});

// compareSeries (e.g. an entity plotted against a peer/benchmark line,
// the NordBond-overlay pattern from the risk dashboard reference) is
// optional — most assets render a single line; only assets authored with
// a genuine comparison carry one.
const CompareSeriesSchema = z.object({
  label: z.string().min(1),
  series: z.array(TrendPointSchema),
});

// intraday (2026-08-22 order: "fix flat short-timeframe charts via real
// data density, not render-time randomness") — a SEPARATE, denser array
// covering roughly the most recent 24h at hourly resolution, not points
// mixed into `series` itself: `series` is daily-resolution end-to-end and
// TrendChart's own sliceByPeriod does a plain `.slice(-days)` against one
// uniform cadence, which a mixed-resolution array would silently break.
// Optional: a period set that only offers 7D+ (no 1H/24H) has no need for
// it, and TrendChart falls back to its prior honest "last 2 daily points"
// behavior when absent, never crashing.
const TrendChartSchema = z.object({
  series: z.array(TrendPointSchema).min(1),
  intraday: z.array(TrendPointSchema).optional(),
  // intradayFine (2026-08-22 follow-up, direct feedback: "even 1h we need
  // more density... much more touchpoints") — a SEPARATE, finer-interval
  // array covering roughly the most recent 1-2h, not a denser version of
  // `intraday` itself: `intraday`'s own hourly cadence is genuinely
  // enough for a 24H view (confirmed, "24h is ok"), and regenerating that
  // whole day at fine resolution just to serve 1H's own slice would be
  // pure waste. Optional, same fallback discipline as `intraday` — a
  // fixture with no `intradayFine` authored has TrendChart fall back to
  // `intraday` (or ultimately the daily 2-point read) for its own 1H view.
  intradayFine: z.array(TrendPointSchema).optional(),
  periods: z.array(TrendPeriodSchema).min(1),
  compareSeries: z.array(CompareSeriesSchema).optional(),
});
export type TrendChartData = z.infer<typeof TrendChartSchema>;

// KeyStat is one row of the class-aware stats table — a plain label/value
// pair, same literal-prop register as Metric's own props (facts, not
// bind data). Which stats appear is authored per asset, not enforced by
// a per-class union in the schema itself (same posture as
// AnalystConsensusSchema's own comment: the schema describes valid stat
// rows, not which ones a given class must carry) — the three column sets
// in the phase order (equity-token: Forward P/E, Trailing P/E, Market
// Cap, Open, Day Range, Dividend Yield, 52W Range, EPS, Volume;
// crypto-native: Market Cap, FDV, 24h Volume, Circulating/Total/Max
// Supply, ATH/ATL; tokenized-rwa: Latest Yield, Recent Move, Total
// Locked, Audit Status, Jurisdiction, Underlying Asset Type) are a
// fixture-authoring convention, not a schema-level branch.
const KeyStatSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]),
});
export type KeyStat = z.infer<typeof KeyStatSchema>;

// snippet's classSpecificFields are authored as a flat record — same
// reasoning as KeyStat above: which fields appear (symbol/IPO/CEO/sector
// for equity-token, launch date/network/category for crypto-native, etc.)
// is a fixture-authoring convention per assetClass, not a schema union.
const SnippetSchema = z.object({
  description: z.string().min(1),
  classSpecificFields: z.array(KeyStatSchema),
});
export type Snippet = z.infer<typeof SnippetSchema>;

// equity-token only (Phase 20 order) — absent for crypto-native/
// tokenized-rwa, never a forced empty state, same "absent means
// genuinely none" convention as EntityDetail's own analystConsensus.
//
// Attribution precedent (2026-08-15 ruling): earnings figures are
// periodic, filing-derived data, not a static identity fact like
// snippet's CEO/headquarters fields (which carry no source at all,
// correctly — nothing to cite for a fact with no update cadence).
// EarningsPoint itself carries no `source` field (not in the order's
// original sketch, not added mid-implementation without approval) —
// instead, author earnings fixtures as MeridianFeed-sourced ("Real-time
// price, volume, and filing feed", sources.json) for any equity-token
// on that venue, extending the existing source rather than inventing a
// new one, same "extend before duplicating" rule as every other source
// citation in this project. A future equity on a different venue should
// extend that venue's own filing-feed source the same way, not default
// back to MeridianFeed by habit.
const EarningsPointSchema = z.object({
  period: z.string().min(1),
  epsActual: z.number(),
  epsEstimate: z.number(),
  revenue: z.number(),
  reportedAt: z.string().min(1),
});
export type EarningsPoint = z.infer<typeof EarningsPointSchema>;

// All classes carry this — the deep-link target for Overview's "Notable
// Price Movement" preview card (News/Analysis tab, per the order's own
// IA law: nothing on Overview is a dead end). Required, all classes
// (2026-08-15 ruling): for yield-register assets (bonds/RE/credit-funds,
// once TradableAsset extends that far) this describes yield/audit/
// settlement EVENTS, not price ticks — reuse the existing NordBond/
// Aldergate event pattern (universe/news.json's own coverage entries),
// never force price-movement language onto a fixed-income asset.
const TimelineEntrySchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  headline: z.string().min(1),
  detail: z.string().min(1).optional(),
  source: AssetSourceSchema,
  // Optional, not required (2026-08-15 follow-up): the asset's own price
  // level as of this entry's date, plus the signed % change the entry's
  // own headline/detail describes (e.g. "clears $3.00... up ~40% off its
  // April low" -> price ~3.00, changePct +40). Deliberately absent for any
  // future yield-register entry (bonds/RE/credit-funds) per this schema's
  // own doc comment above — a yield/audit/settlement event has no single
  // "price that moved," so this stays optional rather than forced.
  price: z.number().optional(),
  changePct: z.number().optional(),
});
export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;

// The CoinGecko "Why BTC is moving" right-rail pattern — a scripted,
// sourced summary, not live LLM generation (same discipline as scene-
// summary/recommendation's own template-generated text, node-vocabulary.
// md's cross-cutting rule). Facts/reasoning register, not a
// recommendation — it explains a price move, it doesn't advise on one.
const AiRationaleSchema = z.object({
  summary: z.string().min(1),
  sources: z.array(AssetSourceSchema).min(1),
  asOf: z.string().min(1),
});
export type AiRationale = z.infer<typeof AiRationaleSchema>;

const RelatedAssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  assetClass: AssetClassSchema,
});
export type RelatedAsset = z.infer<typeof RelatedAssetSchema>;

// Phase 21: third-party bull/bear framing per topic (facts/reasoning
// register, same as aiRationale — never Merlin's own recommendation,
// per KeyIssuesCard's own node-addition test). Sources reuse
// ThinkingStepSource, same as every other citation in this schema — no
// new source type invented. Optional at the TradableAsset level: absent
// means genuinely none authored yet, never a forced empty card.
const KeyIssueViewSchema = z.object({
  text: z.string().min(1),
  sources: z.array(AssetSourceSchema).min(1),
});

const KeyIssueSchema = z.object({
  topic: z.string().min(1),
  bullishView: KeyIssueViewSchema,
  bearishView: KeyIssueViewSchema,
});
export type KeyIssue = z.infer<typeof KeyIssueSchema>;

export const TradableAssetSchema = z.object({
  id: z.string().min(1),
  symbol: z.string().min(1),
  name: z.string().min(1),
  assetClass: AssetClassSchema,
  priceHeader: PriceHeaderSchema,
  trendChart: TrendChartSchema,
  keyStatsTable: z.array(KeyStatSchema).min(1),
  snippet: SnippetSchema,
  // Reused verbatim from Phase 19 — re-skinned, not rebuilt, per this
  // phase's own "check existing library first" instruction. Optional:
  // scoped to crypto/stocks at the fixture level (AnalystConsensusSchema's
  // own comment), absent for tokenized-rwa.
  analystConsensus: AnalystConsensusSchema.optional(),
  // equity-token only — absent means genuinely none, never a forced
  // empty Earnings tab.
  earningsHistory: z.array(EarningsPointSchema).optional(),
  priceMovementTimeline: z.array(TimelineEntrySchema),
  aiRationale: AiRationaleSchema,
  related: z.array(RelatedAssetSchema),
  keyIssues: z.array(KeyIssueSchema).optional(),
});
export type TradableAsset = z.infer<typeof TradableAssetSchema>;
