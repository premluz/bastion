import { z } from "zod";

// Literal-prop node (node-vocabulary.md, Phase 20) — one asset's current
// price read: last price, signed change, an optional after-hours read,
// today's range. Facts register, permanent. A plain directional color on
// the delta is not a CTA (principle 2's own restated line in this
// section) — no red/green PERFORMANCE framing beyond that single signed
// value's own sign, same discipline every other price-fact node in this
// app already holds.
export const AssetPriceHeaderPropsSchema = z.object({
  lastPrice: z.number().positive(),
  changeAbs: z.number(),
  changePct: z.number(),
  asOf: z.string().min(1),
  afterHours: z
    .object({
      price: z.number().positive(),
      changeAbs: z.number(),
      changePct: z.number(),
      asOf: z.string().min(1),
    })
    .optional(),
  dayRange: z.tuple([z.number().positive(), z.number().positive()]),
});
export type AssetPriceHeaderProps = z.infer<typeof AssetPriceHeaderPropsSchema>;
