import { z } from "zod";
import { ConfidenceSchema } from "../thinking";

// ORDER — scene-summary (phase-adjacent, node-vocabulary.md principle 1
// amended): every scene's pinned, first-revealed verdict — the literal
// implementation of "conclude, then substantiate." Provisional register
// (principle 2): it's still a recommendation, just positioned first, not
// restyled as permanent/factual for leading. Literal-prop node like
// recommendation/confidence-meter, but — same exemption recommendation
// itself carries — `recommendation` is generated language grounded in
// scene facts, never a literal restatement, so it's not subject to the
// cross-cutting exact-match rule.
export const SceneSummaryPropsSchema = z.object({
  recommendation: z.string().min(1),
  investigationSummary: z.string().min(1).optional(),
  confidence: ConfidenceSchema,
  confidenceLabel: z.string().min(1),
  sourceRefs: z.array(z.string().min(1)),
  assumptions: z.array(z.string().min(1)).optional(),
  caveat: z.string().min(1).optional(),
});
export type SceneSummaryProps = z.infer<typeof SceneSummaryPropsSchema>;
