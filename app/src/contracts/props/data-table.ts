import { z } from "zod";
import { TableDataSetSchema } from "../data";

// Bind node: data resolves against a TableDataSet via `bind`.
export const DataTablePropsSchema = z.object({
  title: z.string().min(1).optional(),
  data: TableDataSetSchema,
});
export type DataTableProps = z.infer<typeof DataTablePropsSchema>;
