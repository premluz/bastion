import { z } from "zod";
import { ThinkingStepSourceSchema } from "../thinking";

// Literal-prop node (node-vocabulary.md, Phase 20) — reuses
// ThinkingStepSource (the {name, ref} shape rendered by SourceChip
// everywhere provenance is cited), not a new source type. Distinct from
// news-feed (general editorial coverage, bind node over a TableDataSet):
// this is scoped to price-relevant events, authored directly per asset
// (TradableAsset.priceMovementTimeline), reusable across all three asset
// classes — for a yield-register asset (bonds/RE/credit-funds), entries
// describe yield/audit/settlement events, never forced price-tick
// language (see TradableAssetSchema's own TimelineEntrySchema comment).
const TimelineEntrySchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  headline: z.string().min(1),
  detail: z.string().min(1).optional(),
  source: ThinkingStepSourceSchema,
  price: z.number().optional(),
  changePct: z.number().optional(),
});

export const PriceMovementTimelinePropsSchema = z.object({
  title: z.string().min(1).optional(),
  entries: z.array(TimelineEntrySchema),
});
export type PriceMovementTimelineProps = z.infer<typeof PriceMovementTimelinePropsSchema>;
