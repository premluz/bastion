import { z } from "zod";

// Literal-prop node: accent semantics fixed system-wide (ok/warn/alert),
// never per-scene (node-vocabulary.md).
export const StatusTagPropsSchema = z.object({
  label: z.string().min(1),
  tone: z.enum(["ok", "warn", "alert", "neutral"]),
});
export type StatusTagProps = z.infer<typeof StatusTagPropsSchema>;
