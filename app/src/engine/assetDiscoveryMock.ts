import type { MarketAsset } from "./assetDiscovery";

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

interface MockSeed {
  name: string;
  type: string;
  yield: number;
}

const MOCK_SEEDS: Record<string, MockSeed[]> = {
  "covered-bond": [
    { name: "Ostrand Kreditbank 2030", type: "Tokenized Covered Bond", yield: 4.9 },
    { name: "Solberg Sparbank 2032", type: "Tokenized Covered Bond", yield: 5.1 },
    { name: "Kesteren Hypotheek Note", type: "Tokenized Covered Bond", yield: 4.6 },
    { name: "Alderney Finance 2029", type: "Tokenized Covered Bond", yield: 5.3 },
    { name: "Tallvik Bank Covered Bond", type: "Tokenized Covered Bond", yield: 4.8 },
    { name: "Rosmoor Credit Union 2031", type: "Tokenized Covered Bond", yield: 5.0 },
    { name: "Brannigan Savings Bond", type: "Tokenized Covered Bond", yield: 5.4 },
    { name: "Halvard Bank 2033", type: "Tokenized Covered Bond", yield: 4.7 },
    { name: "Cresthaven Bank Note", type: "Tokenized Covered Bond", yield: 5.2 },
    { name: "Winterholt Finance 2030", type: "Tokenized Covered Bond", yield: 4.5 },
    { name: "Larkspur Bank Covered Bond", type: "Tokenized Covered Bond", yield: 5.6 },
  ],
  "real-estate": [
    { name: "Munich Logistics Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.8 },
    { name: "Lyon Retail Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.3 },
    { name: "Rotterdam Office Portfolio", type: "Tokenized Real Estate Portfolio", yield: 7.0 },
    { name: "Warsaw Residential Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.5 },
    { name: "Milan Mixed-Use Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.9 },
    { name: "Vienna Office Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.1 },
    { name: "Copenhagen Logistics Note", type: "Tokenized Real Estate Portfolio", yield: 6.6 },
    { name: "Lisbon Residential Portfolio", type: "Tokenized Real Estate Portfolio", yield: 7.3 },
    { name: "Brussels Retail Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.4 },
    { name: "Prague Mixed-Use Portfolio", type: "Tokenized Real Estate Portfolio", yield: 6.7 },
    { name: "Zurich Office Portfolio", type: "Tokenized Real Estate Portfolio", yield: 5.9 },
  ],
  "credit-fund": [
    { name: "Meridian Credit Fund", type: "Tokenized Diversified Credit Fund", yield: 8.2 },
    { name: "Northbridge Yield Partners", type: "Tokenized Diversified Credit Fund", yield: 7.8 },
    { name: "Ashcombe Credit Fund", type: "Tokenized Diversified Credit Fund", yield: 8.6 },
    { name: "Ravenswood Yield Fund", type: "Tokenized Diversified Credit Fund", yield: 9.4 },
    { name: "Old Harbor Credit Partners", type: "Tokenized Diversified Credit Fund", yield: 7.5 },
    { name: "Silverline Yield Fund", type: "Tokenized Diversified Credit Fund", yield: 8.9 },
    { name: "Amberfield Credit Fund", type: "Tokenized Diversified Credit Fund", yield: 8.1 },
    { name: "Thornbury Yield Partners", type: "Tokenized Diversified Credit Fund", yield: 7.9 },
    { name: "Westgate Credit Fund", type: "Tokenized Diversified Credit Fund", yield: 8.4 },
    { name: "Ironwood Yield Fund", type: "Tokenized Diversified Credit Fund", yield: 9.0 },
    { name: "Cobalt Credit Partners", type: "Tokenized Diversified Credit Fund", yield: 7.6 },
  ],
  commodities: [
    { name: "Gold Royalty Note", type: "Tokenized Commodity Royalty Note", yield: 5.5 },
    { name: "Silver Streaming Note", type: "Tokenized Commodity Royalty Note", yield: 5.8 },
    { name: "Lithium Supply Note", type: "Tokenized Commodity Royalty Note", yield: 7.1 },
    { name: "Cobalt Royalty Certificate", type: "Tokenized Commodity Royalty Note", yield: 6.9 },
    { name: "Nickel Forward Note", type: "Tokenized Commodity Royalty Note", yield: 6.2 },
    { name: "Platinum Allocation Note", type: "Tokenized Commodity Royalty Note", yield: 5.3 },
    { name: "Rare Earth Royalty Note", type: "Tokenized Commodity Royalty Note", yield: 7.4 },
    { name: "Uranium Supply Note", type: "Tokenized Commodity Royalty Note", yield: 6.7 },
    { name: "Palladium Note", type: "Tokenized Commodity Royalty Note", yield: 5.6 },
    { name: "Timber Royalty Note", type: "Tokenized Commodity Royalty Note", yield: 5.1 },
    { name: "Agricultural Commodities Basket", type: "Tokenized Commodity Royalty Note", yield: 6.0 },
  ],
  crypto: [
    { name: "Solstice Index Token", type: "Tokenized Crypto Index", yield: 3.2 },
    { name: "Vector Chain Fund", type: "Tokenized Crypto Index", yield: 4.1 },
    { name: "Nimbus Protocol Note", type: "Tokenized Crypto Index", yield: 2.8 },
    { name: "Halcyon Ledger Index", type: "Tokenized Crypto Index", yield: 3.6 },
    { name: "Quanta Chain Fund", type: "Tokenized Crypto Index", yield: 4.4 },
    { name: "Embernet Token Basket", type: "Tokenized Crypto Index", yield: 3.0 },
    { name: "Driftwood Protocol Index", type: "Tokenized Crypto Index", yield: 3.8 },
    { name: "Lumen Chain Note", type: "Tokenized Crypto Index", yield: 2.5 },
    { name: "Cinder Ledger Fund", type: "Tokenized Crypto Index", yield: 4.7 },
    { name: "Wavelength Protocol Token", type: "Tokenized Crypto Index", yield: 3.4 },
    { name: "Tesseract Chain Index", type: "Tokenized Crypto Index", yield: 3.9 },
    { name: "Obsidian Ledger Fund", type: "Tokenized Crypto Index", yield: 4.2 },
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
export function mockSparkline(baseYield: number, seedIndex: number): { x: string; y: number }[] {
  const points: { x: string; y: number }[] = [];
  for (let day = 0; day < SPARKLINE_LENGTH; day++) {
    const wiggle = Math.sin((day + seedIndex) * 0.9) * 0.15 + Math.sin((day + seedIndex) * 0.31) * 0.08;
    points.push({ x: formatMockDate(day), y: Math.round((baseYield + wiggle) * 100) / 100 });
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
      const points = mockSparkline(seed.yield, index + category.length);
      const last = points[points.length - 1];
      const prev = points[points.length - 2];
      combined.push({
        id: `mock-${category}-${index}`,
        name: seed.name,
        type: seed.type,
        category,
        yield: last?.y ?? seed.yield,
        deltaRecent: last && prev ? Math.round((last.y - prev.y) * 100) / 100 : 0,
        sparklinePoints: points,
      });
    }
  }
  return combined;
}
