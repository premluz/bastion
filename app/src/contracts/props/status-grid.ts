import { z } from "zod";
import { TableDataSetSchema } from "../data";

const TONES = ["ok", "warn", "alert", "neutral"] as const;

// Bound node (many cells means row data, not something hand-authored
// per scene): binds to the existing table DataSet, same labelColumn
// precedent as concentration-map/ring-chart. toneColumn's cells are
// refined to status-tag's own fixed tone set — a bad value fails Zod
// validation and surfaces as FallbackNode (invalid-props), never a
// silently wrong color (CLAUDE.md rule 7).
export const StatusGridPropsSchema = z
  .object({
    title: z.string().min(1).optional(),
    labelColumn: z.string().min(1),
    toneColumn: z.string().min(1),
    data: TableDataSetSchema,
  })
  .refine(
    (props) =>
      props.data.rows.every((row) => {
        const value = row[props.toneColumn];
        return typeof value === "string" && (TONES as readonly string[]).includes(value);
      }),
    { message: `every row's toneColumn value must be one of ${TONES.join("/")}` },
  );
export type StatusGridProps = z.infer<typeof StatusGridPropsSchema>;
