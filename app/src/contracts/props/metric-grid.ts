import { z } from "zod";

// Pure container — equal-weight gestalt of 2-4 metric children, no
// authored knobs of its own (CLAUDE.md node-vocabulary.md).
export const MetricGridPropsSchema = z.object({});
export type MetricGridProps = z.infer<typeof MetricGridPropsSchema>;
