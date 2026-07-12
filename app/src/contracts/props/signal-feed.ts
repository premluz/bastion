import { z } from "zod";
import { TableDataSetSchema } from "../data";

// Bind node: reuses the table DataSet directly (Prem's Phase 3
// binding-mapping ruling — rows read as feed items, no new DataSet kind).
export const SignalFeedPropsSchema = z.object({
  title: z.string().min(1).optional(),
  data: TableDataSetSchema,
});
export type SignalFeedProps = z.infer<typeof SignalFeedPropsSchema>;
