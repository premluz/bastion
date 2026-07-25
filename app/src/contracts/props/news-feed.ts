import { z } from "zod";
import { TableDataSetSchema } from "../data";

// Bind node, same reuse precedent as signal-feed: rows read as articles,
// no new DataSet kind. Column convention (enforced by the component, not
// the schema, same as signal-feed's own date-column convention): the
// first "date"-typed column is the timestamp; of the remaining columns,
// the first is the headline, the second the dek, the third the source.
export const NewsFeedPropsSchema = z.object({
  title: z.string().min(1).optional(),
  data: TableDataSetSchema,
});
export type NewsFeedProps = z.infer<typeof NewsFeedPropsSchema>;
