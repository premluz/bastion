import { z } from "zod";
import { SeriesDataSetSchema } from "../data";

// Bind node: reuses the series DataSet (Phase 21 follow-up, 2026-08-31) —
// same precedent bar-series already set (x is a category label, not
// necessarily a date), one series only: each point is a named driver and
// its own contribution magnitude, e.g. { x: "Governance / Buyback",
// y: 41 }. Exactly one series, unlike bar-series's up-to-3 — this node
// answers "what drove ONE outcome, ranked," not a grouped comparison
// across several parallel series.
export const ContributionBarsPropsSchema = z.object({
  title: z.string().min(1).optional(),
  valueSuffix: z.string().min(1).optional(),
  data: SeriesDataSetSchema.refine((d) => d.series.length === 1, {
    message: "contribution-bars takes exactly one series",
  }),
});
export type ContributionBarsProps = z.infer<typeof ContributionBarsPropsSchema>;
