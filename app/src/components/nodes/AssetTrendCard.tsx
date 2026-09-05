import { Text } from '@astryxdesign/core/Text';
import type { AssetTrendCardProps } from '../../contracts/props/asset-trend-card';
import { AssetLogo } from './AssetLogo';
import { TrendChart } from './TrendChart';
import { Panel } from './Panel';
import priceHeaderStyles from './AssetPriceHeader.module.css';
import styles from './AssetTrendCard.module.css';

// Same signed "+X.XX (+X.XX%)" format AssetPriceHeader.tsx's own
// formatDelta produces — kept local rather than imported (that helper
// isn't exported, and duplicating one line is more honest than reaching
// into another component's internals across a module boundary). Reuses
// AssetPriceHeader.module.css's own .deltaOk/.deltaAlert classes though,
// so the actual color tokens stay the single source of truth.
function formatDelta(abs: number, pct: number): string {
  const sign = abs >= 0 ? '+' : '';
  return `${sign}${abs.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
}

// Deterministic per-entity PRNG (mulberry32, same technique
// AssetTrendGlyph.ts's own seededRandom uses — not imported from there
// since that one is normalized to a fixed 0-100 glyph walk over a fixed
// point count, while this generates a real dated/priced series over a
// caller-chosen `days` window; the surrounding math genuinely differs,
// not a copy of the same function).
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

// Mock-random series (2026-09-01, direct order: "mock random, no need
// creating actual data points... should have random chartline"), real
// calendar dates spanning `days` back from a fixed anchor so TrendChart's
// own axis-granularity logic (7D/1M periods label by MONTH) actually
// varies —
// a hand-authored 7-point window that never crosses a month boundary is
// what produced the earlier "repeats Aug all the time" bug; a real
// 60-90 day window fixes that as a side effect of using real dates, not
// a special case. Ends at the entity's own current price (last value
// pinned), walking backward with the same random-wiggle-plus-drift shape
// AssetTrendGlyph.ts's own generateWalk uses, just over real $ values
// and a caller-chosen point count instead of a normalized 0-100 range.
function generateSeries(seed: string, isUp: boolean, days: number, endPrice: number): { t: string; price: number }[] {
  const random = seededRandom(seed);
  const drift = (isUp ? 1 : -1) * (endPrice * 0.008);
  const values: number[] = [endPrice];
  for (let i = 1; i < days; i += 1) {
    const prev = values[values.length - 1] as number;
    const next = prev - drift + (random() - 0.5) * endPrice * 0.05;
    values.push(Math.max(next, endPrice * 0.05));
  }
  values.reverse();
  // Fixed anchor, not new Date() — same precedent assetDiscoveryMock.ts's
  // own SERIES_ANCHOR_DATE sets (its own comment: mock filler's chart
  // reads as a continuation of the same timeline, not a moving one).
  // new Date() would make this component's own visible date range (and
  // therefore its axis tick labels) drift by a day on every real day
  // that passes, turning the committed Storybook/test:visual baseline
  // stale on a rolling basis for reasons unrelated to any real change —
  // confirmed as a real risk before shipping, not discovered after.
  const anchor = new Date('2026-09-01T00:00:00Z');
  return values.map((price, index) => {
    const date = new Date(anchor);
    date.setUTCDate(date.getUTCDate() - (days - 1 - index));
    return { t: date.toISOString().slice(0, 10), price: Math.round(price * 100) / 100 };
  });
}

export function AssetTrendCard({ id, name, symbol, seed, isUp, days }: AssetTrendCardProps) {
  // Series generated once per prop identity, not per render — a fresh
  // Math.random-free but still deterministic array each render would be
  // harmless correctness-wise (same seed, same output) but wasteful.
  const endPrice = 1 + (seededRandom(seed)() * 199);
  const series = generateSeries(seed, isUp, days, endPrice);
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  const lastPrice = last?.price ?? endPrice;
  const changeAbs = prev ? Math.round((lastPrice - prev.price) * 100) / 100 : 0;
  const changePct = prev && prev.price > 0 ? Math.round((changeAbs / prev.price) * 10000) / 100 : 0;
  const isPositive = changeAbs >= 0;

  return (
    <Panel>
      {/* Identity (logo+name+ticker) left, price+delta right, one row
          (2026-09-01, direct feedback: "name logo on the left price on
          the right in the same row so it makes the whole chart less
          tall") — collapses what was 3 stacked header rows (identity /
          AssetPriceHeader's price row / its own asOf+day-range meta row)
          into 1. asOf/day-range dropped entirely rather than kept as a
          4th line, per that follow-up's own explicit choice — this card
          is a compact peer-comparison tile, not the full Entity Detail
          price header. AssetPriceHeader itself is no longer reused here
          (its own layout is a stacked price-then-meta row, not a
          same-row split), but its exact delta format/color tokens are. */}
      <div className={styles.headerRow}>
        <div className={styles.identityRow}>
          <AssetLogo id={id} />
          <div className={styles.textColumn}>
            <Text type="body" weight="semibold" display="block">
              {name}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers display="block">
              {symbol}
            </Text>
          </div>
        </div>
        <div className={styles.priceColumn}>
          <Text type="large" weight="semibold" hasTabularNumbers display="block">
            ${lastPrice.toFixed(2)}
          </Text>
          <Text
            type="supporting"
            weight="medium"
            hasTabularNumbers
            display="block"
            className={isPositive ? priceHeaderStyles.deltaOk : priceHeaderStyles.deltaAlert}
          >
            {formatDelta(changeAbs, changePct)}
          </Text>
        </div>
      </div>
      {/* No title — the header row above already names this card;
          TrendChart's own header row (title + period control) would
          duplicate the name a second time. */}
      {/* MAX (not 1M — sliceByPeriod's own DAYS_BACK.MAX is 'all', so the
          full generated `days` window renders unsliced; 1M would always
          clip to the last 30, which can land entirely inside one real
          month and reproduce the same tick-repetition bug this node's
          own generateSeries was built to avoid). bleedHeight=224
          (2026-09-01, direct feedback: "30% less height of current") —
          30% under time-series's own 320px bleed default, scoped to this
          card only via the new prop; Entity Detail's own TrendChart
          usage omits it and stays 320px. */}
      <TrendChart hidePeriodSelector periods={['MAX']} series={series} bleedHeight={224} />
    </Panel>
  );
}
