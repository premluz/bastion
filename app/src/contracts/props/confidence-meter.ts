import { z } from "zod";
import { ConfidenceSchema } from "../thinking";

// Literal-prop node (node-vocabulary.md): a restrained instrument beside a
// conclusion, never decorating raw data — value/label authored per-scene.
export const ConfidenceMeterPropsSchema = z.object({
  label: z.string().min(1),
  value: ConfidenceSchema,
});
export type ConfidenceMeterProps = z.infer<typeof ConfidenceMeterPropsSchema>;
