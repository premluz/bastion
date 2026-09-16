import walletsJson from '../../universe/wallets.json';
import { resolveEntityDetail } from './entityDetail';

interface UniverseWalletHolding {
  entityId: string;
  quantity: number;
  costBasis: number;
}

interface UniverseWalletRecord {
  id: string;
  name: string;
  type: string;
  holdings: UniverseWalletHolding[];
}

const wallets = Object.values(walletsJson as Record<string, UniverseWalletRecord>);

export interface AssetHomeRow {
  entityId: string;
  name: string;
  symbol: string;
  value: number;
  quantity: number;
  deltaPercent: number;
}

// Same math as HoldingsPage.tsx's buildHoldingsTable (quantity × current
// price via resolveEntityDetail) — reused rather than re-derived, per
// this page's own brief: a different VISUAL treatment of the same
// holdings data, not a parallel data pipeline. Symbol is read off the
// entity's own "Symbol" attribute (universe/entities.json), falling back
// to the entity id upper-cased if a future entity omits it.
function symbolFor(entityId: string, attributes: { label: string; value: string | number }[]): string {
  const symbolAttr = attributes.find((attribute) => attribute.label === 'Symbol');
  return symbolAttr ? String(symbolAttr.value) : entityId.toUpperCase();
}

export interface AssetsHomeSummary {
  totalValue: number;
  changeAbs: number;
  changePercent: number;
  rows: AssetHomeRow[];
}

// price, not value — TrendChart's own TrendPointSchema shape exactly
// ({t, price}[]), so MoneyPage can pass this straight through as its
// `series` prop with no adaptation.
export interface PortfolioSeriesPoint {
  t: string;
  price: number;
}

// One wallet only (Phase 3 seed scope — see universe/wallets.json's own
// single mock-wallet-1 entry): this page previews a single "your assets"
// balance, not a multi-wallet aggregate like HoldingsPage's own connected-
// wallets list. Empty wallets/holdings resolve to an honest zero-row
// summary rather than a crash.
export function resolveAssetsHomeSummary(): AssetsHomeSummary {
  const wallet = wallets[0];
  if (!wallet) return { totalValue: 0, changeAbs: 0, changePercent: 0, rows: [] };

  let totalValue = 0;
  let previousTotalValue = 0;
  const rows: AssetHomeRow[] = wallet.holdings.map((holding) => {
    const entity = resolveEntityDetail(holding.entityId);
    const currentPrice = entity?.primaryLatest ?? holding.costBasis;
    const deltaRecent = entity?.deltaRecent ?? 0;
    const previousPrice = currentPrice - deltaRecent;
    const value = holding.quantity * currentPrice;
    totalValue += value;
    previousTotalValue += holding.quantity * previousPrice;
    return {
      entityId: holding.entityId,
      name: entity?.name ?? holding.entityId,
      symbol: entity ? symbolFor(holding.entityId, entity.attributes) : holding.entityId.toUpperCase(),
      value,
      quantity: holding.quantity,
      deltaPercent: previousPrice !== 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0,
    };
  });

  const changeAbs = totalValue - previousTotalValue;
  const changePercent = previousTotalValue !== 0 ? (changeAbs / previousTotalValue) * 100 : 0;
  return { totalValue, changeAbs, changePercent, rows };
}

// Real portfolio-value history, not a fabricated one (2026-09-16, direct
// feedback: the Investments chart/timeframe must move together with the
// real balance) — sums quantity × price(t) across every holding that has
// a real universe/datasets.json price series (resolveEntityDetail's own
// `primary.points`), at each date every such holding actually has a
// point for. A holding with no real series (e.g. a future entity with
// only a costBasis) contributes a flat costBasis line instead of being
// dropped, same fallback resolveAssetsHomeSummary's own row math already
// uses — so the aggregate total still reconciles with totalValue above,
// just without a real history to plot for that one holding's share.
export function resolveInvestmentsSeries(): PortfolioSeriesPoint[] {
  const wallet = wallets[0];
  if (!wallet) return [];

  const seriesHoldings = wallet.holdings
    .map((holding) => ({ holding, points: resolveEntityDetail(holding.entityId)?.primary?.points }))
    .filter((entry): entry is { holding: UniverseWalletHolding; points: { x: string; y: number }[] } => !!entry.points && entry.points.length > 0);
  const flatHoldings = wallet.holdings.filter((holding) => !seriesHoldings.some((entry) => entry.holding.entityId === holding.entityId));

  if (seriesHoldings.length === 0) return [];

  // Intersection of dates every series-backed holding actually covers —
  // never a fabricated fill for a date only some holdings have.
  const sharedDates = seriesHoldings
    .reduce<string[]>((dates, entry, index) => {
      const entryDates = new Set(entry.points.map((point) => point.x));
      return index === 0 ? entry.points.map((point) => point.x) : dates.filter((date) => entryDates.has(date));
    }, [])
    .sort();

  const flatValue = flatHoldings.reduce((sum, holding) => sum + holding.quantity * holding.costBasis, 0);

  return sharedDates.map((date) => {
    const price = seriesHoldings.reduce((sum, entry) => {
      const point = entry.points.find((candidate) => candidate.x === date);
      return sum + entry.holding.quantity * (point?.y ?? 0);
    }, flatValue);
    return { t: date, price };
  });
}

// Which of TrendChart's own period tokens the real 7-day series above can
// honestly answer for (2026-09-16, direct feedback: 1D/1M/1Y/All must be
// real buttons, but only the periods actual history covers may render a
// chart or a period-scoped delta — the rest get an honest empty state
// rather than silently reusing the same week under a longer label).
// 24H/7D both read the identical real window (no finer intraday series
// exists to tell them apart) — an honest reflection of the only real
// data available, not a bug.
export const INVESTMENTS_PERIODS = ['24H', '7D', '1M', '1Y', 'MAX'] as const;
export type InvestmentsPeriod = (typeof INVESTMENTS_PERIODS)[number];
const COVERED_PERIODS: ReadonlySet<InvestmentsPeriod> = new Set(['24H', '7D']);

// TrendChart's onPeriodChange is typed against its own full 7-value period
// enum (it has no way to know which narrower array a given caller passed
// as `periods`) — this guard lets InvestmentsTab narrow that callback's
// argument back to InvestmentsPeriod without an unchecked `as` cast, safe
// because TrendChart only ever calls back with a value drawn from the
// exact array it was given (INVESTMENTS_PERIODS here).
export function isInvestmentsPeriod(value: string): value is InvestmentsPeriod {
  return (INVESTMENTS_PERIODS as readonly string[]).includes(value);
}

export function investmentsPeriodHasCoverage(period: InvestmentsPeriod): boolean {
  return COVERED_PERIODS.has(period);
}

export interface InvestmentsPeriodDelta { changeAbs: number; changePercent: number }

// First/last point of the real series — the only honest delta a 7-day
// window can answer, regardless of which covered period (24H or 7D) is
// selected, since both read that same window (see INVESTMENTS_PERIODS'
// own comment). Undefined for an uncovered period: the caller renders an
// honest placeholder instead of a number (2026-09-16 ruling).
export function resolveInvestmentsPeriodDelta(period: InvestmentsPeriod, series: PortfolioSeriesPoint[]): InvestmentsPeriodDelta | undefined {
  if (!investmentsPeriodHasCoverage(period)) return undefined;
  const first = series[0];
  const last = series[series.length - 1];
  if (!first || !last) return undefined;
  const changeAbs = last.price - first.price;
  const changePercent = first.price !== 0 ? (changeAbs / first.price) * 100 : 0;
  return { changeAbs, changePercent };
}

// Deterministic per-series PRNG (mulberry32) — same technique
// AssetTrendGlyph.tsx's own seededRandom already uses for its generated
// walk, reused here rather than re-derived.
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

// DISPLAY-ONLY texture, never a data source (2026-09-16, direct feedback
// against a reference chart: "need more mocked points to be more like
// this chart not so smooth" — the reference is AssetTrendGlyph's own
// procedurally-generated glyph, explicitly sanctioned in ITS OWN comment
// for a context with "no real data to hold"). The Investments chart is
// not that context — its headline/delta stay computed from the real
// 7-point series untouched (resolveInvestmentsPeriodDelta above never
// calls this) — so this function inserts noisy interpolated steps
// BETWEEN each real consecutive point while landing exactly ON every
// real point's own real price at its own real date. The line's overall
// shape (start, end, every real day's real value) stays truthful; only
// the path connecting them gains texture, the same way a real price
// chart has intra-day movement a daily close-only series can't show.
// stepsBetween defaults to enough points that a 7-point week reads as
// dozens of points, matching the reference's own ~48-point density.
export function densifyForDisplay(series: PortfolioSeriesPoint[], seed: string, stepsBetween = 6): PortfolioSeriesPoint[] {
  if (series.length < 2) return series;
  const random = seededRandom(seed);
  const result: PortfolioSeriesPoint[] = [];
  for (let i = 0; i < series.length - 1; i += 1) {
    const from = series[i]!;
    const to = series[i + 1]!;
    result.push(from);
    const span = to.price - from.price;
    // Noise scaled to this segment's own real move (never a fixed
    // absolute wiggle) — a $5 week-over-week change gets proportionally
    // small texture, a $500 one gets proportionally larger, rather than
    // one magic-number amplitude misrepresenting either.
    const noiseScale = Math.max(Math.abs(span), Math.abs(from.price) * 0.01) * 0.35;
    const fromTime = new Date(from.t).getTime();
    const toTime = new Date(to.t).getTime();
    for (let step = 1; step <= stepsBetween; step += 1) {
      const t = step / (stepsBetween + 1);
      const interpolated = from.price + span * t + (random() - 0.5) * noiseScale;
      // A real, valid interpolated TIMESTAMP (not a suffixed string) —
      // TrendChart's own axis logic (formatAxisLabel, granularityForPeriod,
      // unitLabel) all parse `t` as a real date; an invalid one would
      // corrupt tick labels for these synthetic points specifically. Only
      // the PRICE at this timestamp is synthetic texture; the x-position
      // it's plotted at is real time between two real, honest readings.
      result.push({ t: new Date(fromTime + (toTime - fromTime) * t).toISOString(), price: interpolated });
    }
  }
  result.push(series[series.length - 1]!);
  return result;
}
