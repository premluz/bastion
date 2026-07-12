import { z } from "zod";
import { TableDataSetSchema } from "../data";

// Bind node: reuses the table DataSet, transposed by authoring convention —
// first column is the dimension label, each remaining column is one
// compared entity (2-3 per node-vocabulary.md, so 3-4 columns total). No
// new DataSet kind, same precedent as signal-feed's binding ruling.
export const ComparisonPropsSchema = z.object({
  title: z.string().min(1).optional(),
  data: TableDataSetSchema.refine((d) => d.columns.length >= 3 && d.columns.length <= 4, {
    message: "comparison supports 1 dimension column + 2-3 entity columns",
  }),
});
export type ComparisonProps = z.infer<typeof ComparisonPropsSchema>;
