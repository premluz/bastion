import { z } from "zod";
import { ConfidenceSchema } from "../thinking";

// Literal-prop node, but exempt from the exact-match cross-check rule
// (node-vocabulary.md cross-cutting rules): this is generated language
// grounded in facts, never a restatement of them. Provisional register.
export const RecommendationPropsSchema = z.object({
  text: z.string().min(1),
  confidence: ConfidenceSchema.optional(),
  caveat: z.string().min(1).optional(),
});
export type RecommendationProps = z.infer<typeof RecommendationPropsSchema>;
