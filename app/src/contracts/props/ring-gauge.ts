import { z } from "zod";

// Literal-prop node (node-vocabulary.md, Phase 12): a bounded fullness
// fact — value/max/label/tone authored per scene, same standing as
// metric/confidence-meter/status-tag. value may exceed max (a genuine
// limit breach) — not refined out, since that's real data the gauge must
// be able to show (clamped visually to a full ring, never in the number).
// tone is authored, not derived from the ratio — status-tag's fixed
// ok/warn/alert semantics, never confidence-meter's qualifier logic
// (principle 3: this node is facts, never agent confidence).
export const RingGaugePropsSchema = z.object({
  label: z.string().min(1),
  value: z.number().min(0),
  max: z.number().positive(),
  unit: z.string().min(1).optional(),
  tone: z.enum(["ok", "warn", "alert"]),
});
export type RingGaugeProps = z.infer<typeof RingGaugePropsSchema>;
