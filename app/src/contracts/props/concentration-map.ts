import { z } from "zod";
import { TableDataSetSchema } from "../data";

// Bind node: reuses the table DataSet (no new DataSet kind, same precedent
// as signal-feed/comparison's binding rulings). labelColumn/valueColumn
// name which existing columns supply each cell's label and its
// area-driving number; valueSuffix is literal display text (e.g. "%"),
// never a format mini-language. highlightValue names the labelColumn cell,
// if any, the scene wants flagged with --accent-signal (principle 8:
// emphasis is earned, never default) — omitted means no cell is flagged.
export const ConcentrationMapPropsSchema = z.object({
  title: z.string().min(1).optional(),
  labelColumn: z.string().min(1),
  valueColumn: z.string().min(1),
  valueSuffix: z.string().min(1).optional(),
  highlightValue: z.string().min(1).optional(),
  data: TableDataSetSchema,
});
export type ConcentrationMapProps = z.infer<typeof ConcentrationMapPropsSchema>;
