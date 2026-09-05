import { z } from "zod";
import { ThinkingStepSourceSchema } from "../thinking";

// Literal-prop node (node-vocabulary.md, Phase 20) — the CoinGecko "Why
// BTC is moving" right-rail pattern: one scripted, sourced summary
// paragraph. Facts/reasoning register, never the provisional
// recommendation register (principle 2) — explains a move, never advises
// on one. Sources reuse ThinkingStepSource (SourceChip's own shape), not
// Astryx's Citation component (an inline numbered-footnote marker, wrong
// shape for a list of named sources).
export const AiRationaleRailPropsSchema = z.object({
  summary: z.string().min(1),
  sources: z.array(ThinkingStepSourceSchema).min(1),
  asOf: z.string().min(1),
});
export type AiRationaleRailProps = z.infer<typeof AiRationaleRailPropsSchema>;
