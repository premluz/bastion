import type { MarketAsset } from "./assetDiscovery";

// One mock-filler card's construction, split out of assetDiscoveryMock.ts
// when that file crossed CLAUDE.md's 200-line budget (rule 12). Pure:
// seed + category + index in, one MarketAsset out — no module state, so
// it tests and reads standalone.

export interface MockSeed {
  name: string;
  type: string;
  yield?: number;
  price?: number;
  marketCap?: number;
  volume?: number;
  circulatingSupply?: number;
  creditRating?: string;
  distributionFrequency?: string;
  outstanding?: string;
}

type SeriesPoint = MarketAsset["sparklinePoints"][number];

// Crypto/commodities quote percentage deltas off the sparkline itself
// (CMC convention) rather than re-authoring them alongside it, so the
// number under the glyph always agrees with the glyph.
function priceDeltasFrom(seed: MockSeed, points: SeriesPoint[]) {
  if (seed.price === undefined || points.length < 2) return {};
  const firstPrice = points[0]?.y ?? seed.price;
  const lastPrice = points[points.length - 1]?.y ?? seed.price;
  const prevPrice = points[points.length - 2]?.y ?? firstPrice;
  return {
    delta24hPercent: firstPrice > 0 ? Math.round(((lastPrice - prevPrice) / prevPrice) * 10000) / 100 : 0,
    delta7dPercent: firstPrice > 0 ? Math.round(((lastPrice - firstPrice) / firstPrice) * 10000) / 100 : 0,
  };
}

// Optional fields are spread in conditionally rather than assigned onto a
// mutable object: under exactOptionalPropertyTypes, omission and
// `undefined` are different things, so building the shape in one
// expression types cleanly against MarketAsset without an `any`
// (CLAUDE.md rule 11).
export function buildMockAsset(
  seed: MockSeed,
  category: string,
  index: number,
  points: SeriesPoint[],
): MarketAsset {
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  return {
    id: `mock-${category}-${index}`,
    name: seed.name,
    type: seed.type,
    category,
    deltaRecent: last && prev ? Math.round((last.y - prev.y) * 100) / 100 : 0,
    sparklinePoints: points,
    // Yield-based categories: yield value read from the yield series.
    ...(seed.yield !== undefined ? { yield: last?.y ?? seed.yield } : {}),
    // Crypto/commodities: price value + supply figures.
    ...(seed.price !== undefined
      ? {
          price: seed.price,
          ...(seed.volume !== undefined ? { volume: seed.volume } : {}),
          ...(seed.circulatingSupply !== undefined ? { circulatingSupply: seed.circulatingSupply } : {}),
        }
      : {}),
    ...priceDeltasFrom(seed, points),
    ...(seed.marketCap !== undefined ? { marketCap: seed.marketCap } : {}),
    // Bond/RE attributes
    ...(seed.creditRating !== undefined ? { creditRating: seed.creditRating } : {}),
    ...(seed.distributionFrequency !== undefined ? { distributionFrequency: seed.distributionFrequency } : {}),
    ...(seed.outstanding !== undefined ? { outstanding: seed.outstanding } : {}),
  };
}
