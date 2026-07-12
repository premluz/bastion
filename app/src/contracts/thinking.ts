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

export const ThinkingStepSchema = z.object({
  id: z.string().min(1),
  kind: StepKindSchema,
  label: z.string().min(1),
  detail: z.string().optional(),
  durationMs: z.number().int().positive(),
  sources: z.array(ThinkingStepSourceSchema).optional(),
  confidence: ConfidenceSchema.optional(),
});
export type ThinkingStep = z.infer<typeof ThinkingStepSchema>;
