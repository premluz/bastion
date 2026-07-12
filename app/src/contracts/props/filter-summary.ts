import { z } from "zod";

// Literal-prop node: filters are facts, not reasoning. Never interactive
// in v1 — it states constraints, it doesn't edit them.
export const FilterSummaryPropsSchema = z.object({
  constraints: z.array(z.string().min(1)).min(1),
});
export type FilterSummaryProps = z.infer<typeof FilterSummaryPropsSchema>;
