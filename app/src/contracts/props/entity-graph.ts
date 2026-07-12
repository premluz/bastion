import { z } from "zod";
import { GraphDataSetSchema } from "../data";

// Bind node: legible-at-a-glance cap per node-vocabulary.md (≤20 nodes,
// no pan/zoom — the node count must fit the frame).
export const EntityGraphPropsSchema = z.object({
  title: z.string().min(1).optional(),
  data: GraphDataSetSchema.refine((d) => d.nodes.length <= 20, {
    message: "entity-graph supports at most 20 nodes",
  }),
});
export type EntityGraphProps = z.infer<typeof EntityGraphPropsSchema>;
