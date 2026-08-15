import entitiesJson from "../../universe/entities.json";
import datasetsJson from "../../universe/datasets.json";
import newsJson from "../../universe/news.json";
import analystConsensusJson from "../../universe/analystConsensus.json";
import type { DataSet, TableDataSet } from "../contracts/data";
import { AnalystConsensusSchema, type AnalystConsensus } from "../contracts/props/analyst-consensus";
import { getMarketAssets } from "./assetDiscovery";
import { getMockFilledAssets } from "./assetDiscoveryMock";

interface UniverseEntityAttribute {
  label: string;
  value: string | number;
}

interface UniverseEntityDerivative {
  counterparty: string;
  notional: string;
  exposure: string;
  tenor: string;
  tradeDate: string;
}

interface UniverseEntityRecord {
  entity: {
    id: string;
    name: string;
    type: string;
    attributes: UniverseEntityAttribute[];
    derivative?: UniverseEntityDerivative;
    tags?: string[];
  };
  venue?: string;
  intent?: string;
}

interface SeriesPoint {
  x: string;
  y: number;
}

interface ChartLine {
  id: string;
  label: string;
  points: SeriesPoint[];
}

const entities = entitiesJson as Record<string, UniverseEntityRecord>;
const datasets = datasetsJson as Record<string, DataSet>;
const news = newsJson as Record<string, DataSet>;
const analystConsensus = analystConsensusJson as Record<string, unknown>;

const DERIVATIVE_LABELS: Record<keyof UniverseEntityDerivative, string> = {
  counterparty: "Counterparty",
  notional: "Notional",
  exposure: "Mark-to-market exposure",
  tenor: "Tenor",
  tradeDate: "Trade date",
};

export interface EntityDetail {
  id: string;
  name: string;
  type: string;
  attributes: UniverseEntityAttribute[];
  isUniverseEntity: boolean;
  intent?: string;
  category?: string;
  venue?: string;
  // Chart (Phase 16 revision): primary is always present when any series
  // data exists; secondary is the dual-axis line (volatility for bonds,
  // volume for an equity) when the underlying dataset has one — real
  // second dimensions, not decorative, so absent means genuinely none.
  primary?: ChartLine;
  secondary?: ChartLine;
  primaryLatest?: number;
  deltaRecent?: number;
  news?: TableDataSet;
  // Phase 19: third-party analyst opinion, crypto/stocks entities only —
  // absent means genuinely none authored, never a forced empty state
  // (node-vocabulary.md's analyst-consensus entry: scoped only to entity
  // types where it genuinely applies).
  analystConsensus?: AnalystConsensus;
}

const MOCK_CARDS_PER_CATEGORY = 12;

// Two known series-key conventions (Phase 2's bonds, Phase 16's equity) —
// tried in order, first match wins. Scales to a future third asset class
// without hardcoding entity ids: any entity whose id matches one of these
// key patterns gets a real chart, no per-entity special-casing.
function findChartSeries(id: string): { primary: ChartLine; secondary?: ChartLine } | undefined {
  const yieldVol = datasets[`${id}-yield-volatility-90d`];
  if (yieldVol && yieldVol.kind === "series") {
    const [primary, secondary] = yieldVol.series;
    return primary ? { primary, ...(secondary ? { secondary } : {}) } : undefined;
  }
  const priceVolume = datasets[`${id}-price-volume-90d`];
  if (priceVolume && priceVolume.kind === "series") {
    const [primary, secondary] = priceVolume.series;
    return primary ? { primary, ...(secondary ? { secondary } : {}) } : undefined;
  }
  return undefined;
}

function deltaFromPoints(points: SeriesPoint[]): number {
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  return last && prev ? Math.round((last.y - prev.y) * 100) / 100 : 0;
}

// One entry point for "what do we know about this id" (Phase 16,
// EntityDetailPage — reached by clicking any Discover grid card, real or
// mocked filler, or a related-entity link). Own file rather than folded
// into assetDiscovery.ts or assetDiscoveryMock.ts: importing the mock
// generator from either of those would create a circular dependency.
export function resolveEntityDetail(id: string): EntityDetail | undefined {
  const record = entities[id];

  if (record) {
    const derivative = record.entity.derivative;
    const derivativeAttributes: UniverseEntityAttribute[] = derivative
      ? (Object.keys(DERIVATIVE_LABELS) as (keyof UniverseEntityDerivative)[]).map((key) => ({
          label: DERIVATIVE_LABELS[key],
          value: derivative[key],
        }))
      : [];
    const chart = findChartSeries(id);
    const primaryLatest = chart?.primary.points[chart.primary.points.length - 1]?.y;
    const newsData = news[`${id}-news`];
    // Zod-validated, not a blanket cast like `news`/`datasets` above — this
    // file authors analystConsensus.json by hand (no scene-loading pipeline
    // validates it elsewhere the way SceneSchema validates scene JSON), so
    // a malformed entry fails loud here instead of reaching the node as
    // silently-wrong props.
    const consensusRaw = analystConsensus[`${id}-analyst-consensus`];
    const consensusParsed = consensusRaw ? AnalystConsensusSchema.safeParse(consensusRaw) : undefined;
    return {
      id,
      name: record.entity.name,
      type: record.entity.type,
      attributes: [...derivativeAttributes, ...record.entity.attributes],
      isUniverseEntity: true,
      ...(record.intent !== undefined ? { intent: record.intent } : {}),
      ...(record.entity.tags?.[0] !== undefined ? { category: record.entity.tags[0] } : {}),
      ...(record.venue !== undefined ? { venue: record.venue } : {}),
      ...(chart ? { primary: chart.primary, deltaRecent: deltaFromPoints(chart.primary.points) } : {}),
      ...(primaryLatest !== undefined ? { primaryLatest } : {}),
      ...(chart?.secondary ? { secondary: chart.secondary } : {}),
      ...(newsData && newsData.kind === "table" ? { news: newsData } : {}),
      ...(consensusParsed?.success ? { analystConsensus: consensusParsed.data } : {}),
    };
  }

  // Not a universe entity — check the same deterministic mock filler the
  // Discover grid itself renders, so a card there always resolves to
  // something rather than a dead click.
  const mockAsset = getMockFilledAssets(getMarketAssets(), MOCK_CARDS_PER_CATEGORY).find((candidate) => candidate.id === id);
  if (mockAsset) {
    const mockPrimaryLatest = mockAsset.yield ?? mockAsset.price;
    return {
      id,
      name: mockAsset.name,
      type: mockAsset.type,
      attributes: [],
      isUniverseEntity: false,
      category: mockAsset.category,
      primary: { id: "value", label: "Trend", points: mockAsset.sparklinePoints },
      ...(mockPrimaryLatest !== undefined ? { primaryLatest: mockPrimaryLatest } : {}),
      deltaRecent: mockAsset.deltaRecent,
    };
  }

  return undefined;
}

// Related/compare strip (Phase 16 revision): same category or same venue,
// excluding self — venue peers for a cross-venue story (South Bow Corp ↔
// Halberg Materials AG, both Meridian Exchange), sector peers otherwise
// (the four Solent asset categories). Real universe entities only — mock
// filler has no venue/category worth cross-linking.
export function findRelatedEntities(entity: EntityDetail, count: number): { id: string; name: string; type: string }[] {
  const related: { id: string; name: string; type: string }[] = [];
  for (const [id, record] of Object.entries(entities)) {
    if (id === entity.id || related.length >= count) continue;
    const sameCategory = entity.category && record.entity.tags?.[0] === entity.category;
    const sameVenue = entity.venue && record.venue === entity.venue;
    if (sameCategory || sameVenue) related.push({ id, name: record.entity.name, type: record.entity.type });
  }
  return related;
}
