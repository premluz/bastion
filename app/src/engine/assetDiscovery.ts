import entitiesJson from "../../universe/entities.json";
import datasetsJson from "../../universe/datasets.json";
import type { DataSet } from "../contracts/data";

interface UniverseEntityRecord {
  entity: { id: string; name: string; type: string; tags?: string[] };
  intent?: string;
}

interface SeriesPoint {
  x: string;
  y: number;
}

const entities = entitiesJson as Record<string, UniverseEntityRecord>;
const datasets = datasetsJson as Record<string, DataSet>;

export interface MarketAsset {
  id: string;
  name: string;
  type: string;
  category: string;
  intent?: string;
  yield?: number;
  price?: number;
  marketCap?: number;
  volume?: number;
  circulatingSupply?: number;
  creditRating?: string;
  distributionFrequency?: string;
  outstanding?: string;
  deltaRecent: number; // For bonds/RE: pp-based yield delta. For crypto/stocks: 24h price % or DEPRECATED
  delta24hPercent?: number; // 24h price % for crypto/stocks
  delta7dPercent?: number; // 7d price % for crypto/stocks
  sparklinePoints: SeriesPoint[];
}

// Entities that carry a real yield-volatility series (asset-discovery's own
// universe data, Phase 2) — the only ones with genuine price/yield history
// to show a sparkline + delta from. Every other universe entity (a
// derivative, a counterparty, a person) has no such series and stays out
// of the market grid entirely rather than showing a blank/fabricated
// number — "asset discovery" only covers entities that are actual, priced
// assets. Hand-verified: each series' last point equals the matching
// entity's own "Yield" attribute exactly (5.8/7.2/6.4/9.1%), so yield below
// is read from the series, not duplicated/re-authored from `attributes`.
const MARKET_ENTITY_IDS = ["nordbond-2029", "aldergate-estates", "helios-yield-fund", "vantara-metals", "south-bow-corp", "solent-stablecoin", "zenith-protocol", "meridian-logistics", "kynthia-renewables", "valiant-pharma", "nexus-tech", "beacon-retail", "forge-mining"] as const;

// Last 14 points (~2 weeks of the series' daily cadence) — enough for a
// sparkline glyph to read as a real trend without dragging in the full
// 90-day history a glance doesn't need (node-vocabulary.md: "a bare
// glyph... what's the trend, in passing"). Exported: EntitiesPage's
// Trending strip windows resolveEntityDetail's full-series chart the
// same way, so both strips agree on what "recent" means.
export const SPARKLINE_WINDOW = 14;

function getYieldPoints(entityId: string): SeriesPoint[] {
  const dataset = datasets[`${entityId}-yield-volatility-90d`];
  if (!dataset || dataset.kind !== "series") return [];
  return dataset.series[0]?.points ?? [];
}

// Crypto/equity entities carry a PRICE series (`*-price-volume-90d`), not
// a yield-volatility one — getYieldPoints() above only ever matched
// bonds/real-estate/credit-funds (nordbond-2029, aldergate-estates,
// helios-yield-fund), so every other market entity (South Bow Corp,
// Zenith Protocol, Solent Stablecoin, Meridian Logistics, Kynthia
// Renewables, Valiant Pharma, Nexus Tech, Beacon Retail, Forge Mining)
// silently fell through to deltaRecent: 0 and no sparkline — confirmed by
// checking datasets.json directly: no entity has both keys, so this is
// the SECOND lookup to try, not a merge. vantara-metals (commodities) has
// neither key and genuinely has no real series to compute from — stays
// honestly deltaRecent: 0/no sparkline, this codebase's own established
// "never fabricate" rule, not a gap this fix should paper over.
function getPricePoints(entityId: string): SeriesPoint[] {
  const dataset = datasets[`${entityId}-price-volume-90d`];
  if (!dataset || dataset.kind !== "series") return [];
  return dataset.series[0]?.points ?? [];
}

export function getMarketAssets(): MarketAsset[] {
  const assets: MarketAsset[] = [];
  for (const id of MARKET_ENTITY_IDS) {
    const record = entities[id];
    if (!record) continue;
    const yieldPoints = getYieldPoints(id);
    if (yieldPoints.length > 0) {
      const last = yieldPoints[yieldPoints.length - 1];
      const prev = yieldPoints[yieldPoints.length - 2];
      assets.push({
        id,
        name: record.entity.name,
        type: record.entity.type,
        category: record.entity.tags?.[0] ?? "asset",
        ...(record.intent !== undefined ? { intent: record.intent } : {}),
        yield: last?.y ?? 0,
        deltaRecent: last && prev ? Math.round((last.y - prev.y) * 100) / 100 : 0,
        sparklinePoints: yieldPoints.slice(-SPARKLINE_WINDOW),
      });
      continue;
    }
    // Price-style path — deltaRecent here is a POINT-OVER-POINT PERCENT
    // change (matching the interface's own documented "24h price %" for
    // crypto/stocks, distinct from the yield path's raw pp difference
    // above), computed the same way EntityAssetTableCells.tsx's own
    // default-category delta cell already reads this field regardless of
    // which unit produced it.
    const pricePoints = getPricePoints(id);
    const lastPrice = pricePoints[pricePoints.length - 1];
    const prevPrice = pricePoints[pricePoints.length - 2];
    const deltaRecent = lastPrice && prevPrice && prevPrice.y !== 0 ? Math.round(((lastPrice.y - prevPrice.y) / prevPrice.y) * 10000) / 100 : 0;
    assets.push({
      id,
      name: record.entity.name,
      type: record.entity.type,
      category: record.entity.tags?.[0] ?? "asset",
      ...(record.intent !== undefined ? { intent: record.intent } : {}),
      ...(lastPrice ? { price: lastPrice.y } : {}),
      deltaRecent,
      sparklinePoints: pricePoints.slice(-SPARKLINE_WINDOW),
    });
  }
  return assets;
}

// Single-entity lookup (Phase 16, EntityDetailPage) — same pure
// getMarketAssets() call every other consumer already makes, no caching
// layer added just for this.
export function findMarketAsset(id: string): MarketAsset | undefined {
  return getMarketAssets().find((asset) => asset.id === id);
}

// "Notable movers" — ranked by the size of the move, not its direction;
// a big drop is just as notable as a big gain (facts register, principle
// 2 — this strip observes, it doesn't recommend a side).
export function rankMovers(assets: MarketAsset[], count: number): MarketAsset[] {
  return [...assets].sort((a, b) => Math.abs(b.deltaRecent) - Math.abs(a.deltaRecent)).slice(0, count);
}

// Raw (unhydrated) scene fixtures, same import.meta.glob pattern
// keywordResolver.ts already uses — scene.data entries are either a
// DataSet or a bare { "$ref": "<universe key>" }, and refs only ever
// appear at that top level (never nested), so a shallow scan of each
// scene's own `data` object is enough to know which entities it cites.
const sceneModules = import.meta.glob<unknown>("../../scenes/*.scene.json", { eager: true, import: "default" });

function isUniverseRef(value: unknown): value is { $ref: string } {
  return typeof value === "object" && value !== null && "$ref" in value && typeof (value as { $ref: unknown }).$ref === "string";
}

const entityIdsBySceneId = new Map<string, Set<string>>();
for (const raw of Object.values(sceneModules)) {
  if (typeof raw !== "object" || raw === null || !("id" in raw) || !("data" in raw)) continue;
  const sceneId = String((raw as { id: unknown }).id);
  const data = (raw as { data: unknown }).data;
  if (typeof data !== "object" || data === null) continue;
  const cited = new Set<string>();
  for (const entry of Object.values(data)) {
    if (isUniverseRef(entry) && entry.$ref in entities) cited.add(entry.$ref);
  }
  entityIdsBySceneId.set(sceneId, cited);
}

// Reverse lookup (Phase 16, EntityDetailPage's scoped Investigations
// panel): does this scene's own data cite this entity via $ref. One
// scan of the raw scene fixtures, cached at module load.
export function sceneReferencesEntity(sceneId: string, entityId: string): boolean {
  return entityIdsBySceneId.get(sceneId)?.has(entityId) ?? false;
}

export interface UniverseEntitySummary {
  id: string;
  name: string;
  type: string;
}

// "Newly added to universe" — session-fixed, not a real recency signal
// (this universe has no authored "added on" date for any entity):
// deliberately the last few keys in entities.json's own insertion order,
// styled identically to the other two strips per the order's own
// instruction ("styled the same"), never claimed as live data.
export function getNewlyAdded(count: number): UniverseEntitySummary[] {
  return Object.values(entities)
    .slice(-count)
    .map((record) => ({ id: record.entity.id, name: record.entity.name, type: record.entity.type }));
}
