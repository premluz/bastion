import type { MarketAsset } from "./assetDiscovery";
import { buildMockAsset, type MockSeed } from "./mockAssetBuilder";

// Direct feedback (2026-07-20): the tracked-assets grid read as too thin
// at 4 real cards — demo density needs a fuller browsing surface. These
// are DELIBERATELY fictional filler, not universe entities: no `intent`
// (never investigable — "nothing is linked or dynamic" on these rows by
// design, same honesty precedent as Data Sources' own mock catalog and
// the Solent-repositioning order's "not yet analyzed" row), no backing
// series in universe/datasets.json. Values are deterministic (seeded by
// index, not Math.random) so the grid renders identically every load —
// same "seeded generator, committed, not ad-hoc" discipline Phase 8E's
// fixture-density script already established.
export const CATEGORY_LABELS: Record<string, string> = {
  "covered-bond": "Covered Bond",
  "real-estate": "Real Estate",
  "credit-fund": "Credit Fund",
  commodities: "Commodities",
  crypto: "Crypto",
  asset: "Other",
};

const MOCK_SEEDS: Record<string, MockSeed[]> = {
  "covered-bond": [
    { name: "Ostrand Kreditbank 2030", type: "Tokenized Covered Bond", yield: 4.9, creditRating: "AA", outstanding: "€120M" },
    { name: "Solberg Sparbank 2032", type: "Tokenized Covered Bond", yield: 5.1, creditRating: "A+", outstanding: "€95M" },
    { name: "Kesteren Hypotheek Note", type: "Tokenized Covered Bond", yield: 4.6, creditRating: "AA-", outstanding: "€140M" },
    { name: "Alderney Finance 2029", type: "Tokenized Covered Bond", yield: 5.3, creditRating: "A", outstanding: "€75M" },
    { name: "Tallvik Bank Covered Bond", type: "Tokenized Covered Bond", yield: 4.8, creditRating: "AA+", outstanding: "€165M" },
    { name: "Rosmoor Credit Union 2031", type: "Tokenized Covered Bond", yield: 5.0, creditRating: "A", outstanding: "€88M" },
    { name: "Brannigan Savings Bond", type: "Tokenized Covered Bond", yield: 5.4, creditRating: "A-", outstanding: "€62M" },
    { name: "Halvard Bank 2033", type: "Tokenized Covered Bond", yield: 4.7, creditRating: "AA", outstanding: "€125M" },
    { name: "Cresthaven Bank Note", type: "Tokenized Covered Bond", yield: 5.2, creditRating: "A+", outstanding: "€92M" },
    { name: "Winterholt Finance 2030", type: "Tokenized Covered Bond", yield: 4.5, creditRating: "AA-", outstanding: "€150M" },
    { name: "Larkspur Bank Covered Bond", type: "Tokenized Covered Bond", yield: 5.6, creditRating: "A", outstanding: "€70M" },
  ],
  "real-estate": [
    { name: "Munich Logistics Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.8, distributionFrequency: "Quarterly", outstanding: "€108M" },
    { name: "Lyon Retail Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.3, distributionFrequency: "Quarterly", outstanding: "€85M" },
    { name: "Rotterdam Office Portfolio", type: "Tokenized Real Estate Portfolio", yield: 7.0, distributionFrequency: "Semi-annual", outstanding: "€125M" },
    { name: "Warsaw Residential Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.5, distributionFrequency: "Quarterly", outstanding: "€92M" },
    { name: "Milan Mixed-Use Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.9, distributionFrequency: "Annual", outstanding: "€78M" },
    { name: "Vienna Office Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.1, distributionFrequency: "Quarterly", outstanding: "€110M" },
    { name: "Copenhagen Logistics Note", type: "Tokenized Real Estate Portfolio", yield: 6.6, distributionFrequency: "Semi-annual", outstanding: "€98M" },
    { name: "Lisbon Residential Portfolio", type: "Tokenized Real Estate Portfolio", yield: 7.3, distributionFrequency: "Quarterly", outstanding: "€65M" },
    { name: "Brussels Retail Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.4, distributionFrequency: "Quarterly", outstanding: "€88M" },
    { name: "Prague Mixed-Use Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.7, distributionFrequency: "Annual", outstanding: "€72M" },
    { name: "Zurich Office Portfolio", type: "Tokenized Real Estate Portfolio", yield: 5.9, distributionFrequency: "Semi-annual", outstanding: "€135M" },
  ],
  "credit-fund": [
    { name: "Meridian Credit Fund", type: "Tokenized Diversified Credit Fund", yield: 8.2, creditRating: "BB+", outstanding: "€145M" },
    { name: "Northbridge Yield Partners", type: "Tokenized Diversified Credit Fund", yield: 7.8, creditRating: "BB", outstanding: "€120M" },
    { name: "Ashcombe Credit Fund", type: "Tokenized Diversified Credit Fund", yield: 8.6, creditRating: "B+", outstanding: "€95M" },
    { name: "Ravenswood Yield Fund", type: "Tokenized Diversified Credit Fund", yield: 9.4, creditRating: "B", outstanding: "€68M" },
    { name: "Old Harbor Credit Partners", type: "Tokenized Diversified Credit Fund", yield: 7.5, creditRating: "BB+", outstanding: "€110M" },
    { name: "Silverline Yield Fund", type: "Tokenized Diversified Credit Fund", yield: 8.9, creditRating: "BB", outstanding: "€82M" },
    { name: "Amberfield Credit Fund", type: "Tokenized Diversified Credit Fund", yield: 8.1, creditRating: "BB-", outstanding: "€125M" },
    { name: "Thornbury Yield Partners", type: "Tokenized Diversified Credit Fund", yield: 7.9, creditRating: "BB+", outstanding: "€105M" },
    { name: "Westgate Credit Fund", type: "Tokenized Diversified Credit Fund", yield: 8.4, creditRating: "BB", outstanding: "€92M" },
    { name: "Ironwood Yield Fund", type: "Tokenized Diversified Credit Fund", yield: 9.0, creditRating: "B+", outstanding: "€75M" },
    { name: "Cobalt Credit Partners", type: "Tokenized Diversified Credit Fund", yield: 7.6, creditRating: "BB-", outstanding: "€115M" },
  ],
  commodities: [
    { name: "Gold Royalty Note", type: "Tokenized Commodity Royalty Note", price: 2045.50, volume: 2180000, outstanding: "€88M" },
    { name: "Silver Streaming Note", type: "Tokenized Commodity Royalty Note", price: 28.35, volume: 18200000, outstanding: "€62M" },
    { name: "Lithium Supply Note", type: "Tokenized Commodity Royalty Note", price: 145.20, volume: 420000, outstanding: "€75M" },
    { name: "Cobalt Royalty Certificate", type: "Tokenized Commodity Royalty Note", price: 22.80, volume: 8900000, outstanding: "€58M" },
    { name: "Nickel Forward Note", type: "Tokenized Commodity Royalty Note", price: 8.45, volume: 95000000, outstanding: "€92M" },
    { name: "Platinum Allocation Note", type: "Tokenized Commodity Royalty Note", price: 1085.00, volume: 380000, outstanding: "€70M" },
    { name: "Rare Earth Royalty Note", type: "Tokenized Commodity Royalty Note", price: 68.50, volume: 650000, outstanding: "€48M" },
    { name: "Uranium Supply Note", type: "Tokenized Commodity Royalty Note", price: 78.25, volume: 2100000, outstanding: "€65M" },
    { name: "Palladium Note", type: "Tokenized Commodity Royalty Note", price: 975.00, volume: 520000, outstanding: "€55M" },
    { name: "Timber Royalty Note", type: "Tokenized Commodity Royalty Note", price: 385.00, volume: 1200000, outstanding: "€42M" },
    { name: "Agricultural Commodities Basket", type: "Tokenized Commodity Royalty Note", price: 412.80, volume: 3200000, outstanding: "€78M" },
  ],
  crypto: [
    { name: "Solstice Index Token", type: "Tokenized Crypto Index", price: 1248.50, marketCap: 2450000000, volume: 145200000, circulatingSupply: 1962000 },
    { name: "Vector Chain Fund", type: "Tokenized Crypto Index", price: 0.8245, marketCap: 985000000, volume: 42800000, circulatingSupply: 1194000000 },
    { name: "Nimbus Protocol Note", type: "Tokenized Crypto Index", price: 15.20, marketCap: 1280000000, volume: 285600000, circulatingSupply: 84200000 },
    { name: "Halcyon Ledger Index", type: "Tokenized Crypto Index", price: 42.15, marketCap: 1850000000, volume: 152300000, circulatingSupply: 43900000 },
    { name: "Quanta Chain Fund", type: "Tokenized Crypto Index", price: 0.5680, marketCap: 745000000, volume: 28900000, circulatingSupply: 1311000000 },
    { name: "Embernet Token Basket", type: "Tokenized Crypto Index", price: 3.24, marketCap: 562000000, volume: 18400000, circulatingSupply: 173500000 },
    { name: "Driftwood Protocol Index", type: "Tokenized Crypto Index", price: 125.80, marketCap: 1650000000, volume: 95200000, circulatingSupply: 13100000 },
    { name: "Lumen Chain Note", type: "Tokenized Crypto Index", price: 0.1245, marketCap: 425000000, volume: 62800000, circulatingSupply: 3415000000 },
    { name: "Cinder Ledger Fund", type: "Tokenized Crypto Index", price: 2185.00, marketCap: 3200000000, volume: 248500000, circulatingSupply: 1465000 },
    { name: "Wavelength Protocol Token", type: "Tokenized Crypto Index", price: 78.50, marketCap: 1480000000, volume: 118200000, circulatingSupply: 18850000 },
    { name: "Tesseract Chain Index", type: "Tokenized Crypto Index", price: 365.20, marketCap: 2100000000, volume: 165800000, circulatingSupply: 5750000 },
    { name: "Obsidian Ledger Fund", type: "Tokenized Crypto Index", price: 12.45, marketCap: 895000000, volume: 45600000, circulatingSupply: 71880000 },
  ],
};

const SPARKLINE_LENGTH = 14;

// Same anchor the real yield-volatility-90d fixtures end on (Phase 2
// universe data) — mock filler's chart reads as a continuation of the
// same timeline rather than leaking an internal "mock-day-N" label into
// the UI (caught live: EntityDetailPage's Trend chart, unlike the bare
// Sparkline glyph elsewhere, actually renders x-axis tick labels).
const SERIES_ANCHOR_DATE = new Date('2026-07-02T00:00:00Z');

function formatMockDate(dayOffset: number): string {
  const date = new Date(SERIES_ANCHOR_DATE);
  date.setUTCDate(date.getUTCDate() - (SPARKLINE_LENGTH - 1 - dayOffset));
  return date.toISOString().slice(0, 10);
}

// Deterministic wiggle (two off-phase sine terms keyed by seedIndex, no
// Math.random) — a plausible-looking trend glyph that's stable across
// renders/screenshots rather than actual synthetic history. Exported:
// EntitiesPage reuses this exact generator for the Discover strips'
// no-real-data rows (Mira Voss, Halberg Materials AG, Kestrel Holdings —
// explicit architect ruling, 2026-07-25) rather than a second
// implementation of the same seeded-sine technique.
export function mockSparkline(baseValue: number, seedIndex: number): { x: string; y: number }[] {
  const points: { x: string; y: number }[] = [];
  for (let day = 0; day < SPARKLINE_LENGTH; day++) {
    const wiggle = Math.sin((day + seedIndex) * 0.9) * 0.15 + Math.sin((day + seedIndex) * 0.31) * 0.08;
    points.push({ x: formatMockDate(day), y: Math.round((baseValue + wiggle) * 100) / 100 });
  }
  return points;
}

// Fills each category to `perCategory` cards, real assets first (still
// linked/dynamic where they carry an intent), mock filler after —
// mock filler never carries `intent`, so it can never resolve to an
// investigation regardless of card-click wiring elsewhere.
export function getMockFilledAssets(realAssets: MarketAsset[], perCategory: number): MarketAsset[] {
  const byCategory = new Map<string, MarketAsset[]>();
  for (const asset of realAssets) {
    const list = byCategory.get(asset.category) ?? [];
    list.push(asset);
    byCategory.set(asset.category, list);
  }

  const categories = new Set([...Object.keys(MOCK_SEEDS), ...byCategory.keys()]);
  const combined: MarketAsset[] = [];
  for (const category of categories) {
    const real = byCategory.get(category) ?? [];
    combined.push(...real);
    const seeds = MOCK_SEEDS[category] ?? [];
    const needed = Math.max(0, perCategory - real.length);
    for (let index = 0; index < Math.min(needed, seeds.length); index++) {
      const seed = seeds[index];
      if (!seed) continue;
      // Sparkline trend reflects the primary quoted metric: yield for yield-bearing
      // assets, price for crypto/commodities. baseValue drives the sparkline
      // generation; deltaRecent is derived from the same series.
      const baseValue = seed.price ?? seed.yield ?? 0;
      const points = mockSparkline(baseValue, index + category.length);
      combined.push(buildMockAsset(seed, category, index, points));
    }
  }
  return combined;
}
