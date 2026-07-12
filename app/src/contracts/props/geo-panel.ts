import { z } from "zod";
import { GeoDataSetSchema } from "../data";

// Bind node: stylized abstract map, no tile service (node-vocabulary.md).
export const GeoPanelPropsSchema = z.object({
  title: z.string().min(1).optional(),
  data: GeoDataSetSchema,
});
export type GeoPanelProps = z.infer<typeof GeoPanelPropsSchema>;
