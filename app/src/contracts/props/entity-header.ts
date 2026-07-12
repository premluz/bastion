import { z } from "zod";
import { EntityDataSetSchema } from "../data";

// Bind node: data resolves against an EntityDataSet. status is a literal
// prop (tone is presentation, not data) — cross-checked by hand against
// the bound entity's own status-bearing attribute per the scene-authoring
// skill. Dense factual register only: never reasoning or confidence.
export const EntityHeaderPropsSchema = z.object({
  data: EntityDataSetSchema,
  status: z
    .object({
      label: z.string().min(1),
      tone: z.enum(["ok", "warn", "alert", "neutral"]),
    })
    .optional(),
});
export type EntityHeaderProps = z.infer<typeof EntityHeaderPropsSchema>;
