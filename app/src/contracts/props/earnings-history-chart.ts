import { z } from "zod";

// Literal-prop node (node-vocabulary.md, Phase 20) — paired actual-vs-
// estimate EPS bars per quarter, equity-token only (absent for crypto-
// native/tokenized-rwa at the TradableAsset level, never a forced empty
// state on this component itself — it renders whatever entries it's
// given, scoping happens at the call site).
const EarningsPointSchema = z.object({
  period: z.string().min(1),
  epsActual: z.number(),
  epsEstimate: z.number(),
  revenue: z.number(),
  reportedAt: z.string().min(1),
});

export const EarningsHistoryChartPropsSchema = z.object({
  title: z.string().min(1).optional(),
  points: z.array(EarningsPointSchema),
});
export type EarningsHistoryChartProps = z.infer<typeof EarningsHistoryChartPropsSchema>;
