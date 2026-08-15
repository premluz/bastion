import { z } from "zod";

// Literal-prop node (node-vocabulary.md, Phase 19): two related facts read
// together — an analyst sentiment distribution (bearish/neutral/bullish
// counts, authored per entity) and a price-position axis (low/average/
// high/current). Facts register, permanent, never rendered in the voice
// face (principle 2) — this is third-party opinion, never Merlin's own
// recommendation. Scoped to crypto/stocks entities only at the call site
// (EntityDetailPage), not enforced in the schema itself — the schema
// describes valid consensus data, not which entity types may carry it.
export const AnalystConsensusSchema = z.object({
  asOf: z.string().min(1),
  distribution: z.object({
    bearish: z.number().int().min(0),
    neutral: z.number().int().min(0),
    bullish: z.number().int().min(0),
  }),
  priceTargets: z.object({
    low: z.number().positive(),
    average: z.number().positive(),
    high: z.number().positive(),
    current: z.number().positive(),
  }),
});
export type AnalystConsensus = z.infer<typeof AnalystConsensusSchema>;

export const AnalystConsensusPropsSchema = z.object({
  consensus: AnalystConsensusSchema,
});
export type AnalystConsensusProps = z.infer<typeof AnalystConsensusPropsSchema>;
