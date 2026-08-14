import { z } from "zod";

export const StepKindSchema = z.enum([
  "plan",
  "search",
  "retrieve",
  "correlate",
  "synthesize",
  "verify",
]);
export type StepKind = z.infer<typeof StepKindSchema>;

export const ConfidenceSchema = z.number().min(0).max(1);
export type Confidence = z.infer<typeof ConfidenceSchema>;

// Shared by recommendation (node) and ConfidenceBadge (trail) — one
// canonical banding, not reimplemented per consumer.
export function confidenceQualifier(value: Confidence): "low" | "moderate" | "high" {
  if (value >= 0.8) return "high";
  if (value >= 0.5) return "moderate";
  return "low";
}

export const ThinkingStepSourceSchema = z.object({
  name: z.string().min(1),
  ref: z.string().min(1),
});
export type ThinkingStepSource = z.infer<typeof ThinkingStepSourceSchema>;

// Mock web-search result — display-only placeholder data for StepRow's new
// SearchResultsCard (search-kind steps only). Deliberately separate from
// ThinkingStepSource/`sources` above: `sources` cites internal system
// provenance (MarketTape, RiskLens) and renders as the canonical SourceChip
// pill everywhere it appears (trail, panel attributions, recommendations,
// per node-vocabulary.md) — untouched by this addition. `webResults` cites
// external web pages (title + domain, no internal-system meaning) and
// renders only in the trail's own expandable card, never as a SourceChip.
export const WebResultSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  domain: z.string().min(1),
});
export type WebResult = z.infer<typeof WebResultSchema>;

export const ThinkingStepSchema = z.object({
  id: z.string().min(1),
  kind: StepKindSchema,
  label: z.string().min(1),
  detail: z.string().optional(),
  durationMs: z.number().int().positive(),
  sources: z.array(ThinkingStepSourceSchema).optional(),
  confidence: ConfidenceSchema.optional(),
  webResults: z.array(WebResultSchema).optional(),
});
export type ThinkingStep = z.infer<typeof ThinkingStepSchema>;
