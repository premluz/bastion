import { z } from "zod";

// "Identity + current price + trend, one bordered card" (2026-09-01,
// direct order: a peer-comparison row needs 3 of these side by side) —
// bundles three pieces Entity Detail already keeps separate (EntityPaneTitle's
// own logo+name+ticker, AssetPriceHeader, TrendChart) into one scene-
// authorable node, since a scene author needs to place N of these in a
// row and none of the three pieces alone gives that in one shot. Every
// constituent component is reused verbatim, not rebuilt — this node only
// owns the composition + Panel border.
//
// Series data is mock-random (2026-09-01, direct order: "mock random, no
// need creating actual data points") — seed drives a deterministic walk
// (AssetTrendGlyph.ts's own generateWalk precedent) over `days` real
// calendar days ending today, so axis ticks land on genuinely different
// months rather than repeating a single month label the way a 7-point,
// all-in-one-month series always would.
export const AssetTrendCardPropsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string().min(1),
  seed: z.string().min(1),
  isUp: z.boolean(),
  // Days of history to generate, ending today — 60-90 gives ticks real
  // month variety; a bare 7D window (this app's other TrendChart usages)
  // never spans a month boundary.
  days: z.number().int().min(14).max(365),
});
export type AssetTrendCardProps = z.infer<typeof AssetTrendCardPropsSchema>;
