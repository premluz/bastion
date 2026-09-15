import { useState } from 'react';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Text } from '@astryxdesign/core/Text';
import type { TrendChartProps } from '../../contracts/props/trend-chart';
import type { SeriesDataSet } from '../../contracts/data';
import { TimeSeries } from './TimeSeries';
import glowStyles from '../../theme/glow.module.css';
import bleedStyles from '../../theme/bleed.module.css';
import styles from './TrendChart.module.css';

// Days-back per period, applied against daily-resolution fixture data —
// 7D and up genuinely have that much daily resolution to slice into, so
// this stays exactly as it was.
const DAYS_BACK: Record<TrendChartProps['periods'][number], number | 'all'> = {
  '1H': 2,
  '24H': 2,
  '7D': 7,
  '1M': 30,
  YTD: 'all',
  '1Y': 'all',
  MAX: 'all',
};

// 1H/24H (2026-08-22 order + two follow-ups) — redefined from "show only
// the last hour/day" to resolution selectors, matching how the named
// reference tool's own period buttons work: the visible WINDOW stays
// wide, only point RESOLUTION changes ("even though we showing 1h scale
// selected we can show days, not hours... like in reference so we could
// show larger period of a week but hourly movements"). 24H reads the
// ENTIRE `intraday` array (hourly points, generate-series.mjs's
// chainIntradaySeries — now spans a real week, not one day). 1H reads
// the ENTIRE `intradayFine` array (5-minute points, spans a real 2-3
// days) — hourly resolution genuinely can't give a meaningful "1H" read,
// so it uses the finer array instead of intraday. Both fall back to
// `intraday`, then the daily 2-point read, if a fixture has no denser
// array authored — same fallback discipline throughout.
const HAS_INTRADAY_PERIOD: Partial<Record<TrendChartProps['periods'][number], true>> = {
  '24H': true,
};
const HAS_FINE_PERIOD: Partial<Record<TrendChartProps['periods'][number], true>> = {
  '1H': true,
};

// Axis label formatting, display-only — the underlying point's real `t`
// value is never altered, only what's shown on the tick. Intraday points
// carry full ISO datetimes ("2026-07-02T14:00:00.000Z"); daily points are
// bare dates ("2026-07-02"). Both were found illegible/oversized at chart-
// tick scale before this: a raw ISO timestamp for hours, and a full
// YYYY-MM-DD for days. Dates render as short "MMM D" (e.g. "Jun 27").
// Datetimes render as "MMM D, h(:mm)a" (e.g. "Jun 30, 3pm") — a bare
// hour-only label ("3pm") was fine when 1H/24H each covered a single day,
// but both now span multiple real days (2026-08-22 second follow-up:
// "even though we showing 1h scale selected we can show days, not
// hours... like in reference"), and an hour-only label repeats
// identically across different days with no way to tell them apart.
// Minutes are appended only when the point doesn't land exactly on the
// hour, so 24H's hourly points keep the shorter "Jun 30, 3pm" read.
function formatAxisLabel(t: string): string {
  const isDatetime = t.includes('T');
  const date = new Date(t);
  if (Number.isNaN(date.getTime())) return t;
  const shortDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  if (!isDatetime) return shortDate;
  // UTC, not local time — generateIntradaySeries authors these points on
  // the hour/minute in UTC (generate-series.mjs), and reading them back
  // in the viewer's own local zone would silently shift which moment
  // each point actually claims to be.
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const hour12 = hours % 12 || 12;
  const suffix = hours < 12 ? 'am' : 'pm';
  const time = minutes === 0 ? `${hour12}${suffix}` : `${hour12}:${String(minutes).padStart(2, '0')}${suffix}`;
  return `${shortDate}, ${time}`;
}

// Axis tick GRANULARITY (2026-08-22 second follow-up, direct feedback:
// "reference shows just 1 number every [tick]... 16 17 18 which indicates
// day (even on 1h scale)... on 1d scale shows month Aug Sep... on month
// scale shows years 2024 2026 — this is because such density"). Which
// unit an explicit tick (see EXPLICIT_TICKS below) is labeled with
// depends on the active period's own resolution, not a universal rule:
// 1H/24H (real intraday resolution) label with day-of-month; 7D/1M
// (still daily resolution, but a whole month can be on screen at once —
// order's own "1d scale shows month" case) label with month name;
// YTD/1Y/MAX historically assumed year-level ticks unconditionally (this
// fixture's own real data never spanned multiple years, so period name
// alone was "authored to hold if it someday does" — that assumption
// broke the first time it was tested against a genuinely different
// input: a MAX-period peer-comparison card generating ~75 days of mock
// history, 2026-09-01, repeated a single year label the same way an
// under-a-month 7D window once repeated a single month label. Now
// span-aware: a YTD/1Y/MAX window under ~1 real year gets month
// granularity instead, regardless of period name; day/month periods
// (7D/1M/24H/1H) are unaffected, always exactly as before.
type AxisGranularity = 'day' | 'month' | 'year';

const YEAR_GRANULARITY_MIN_SPAN_DAYS = 366;

function granularityForPeriod(period: TrendChartProps['periods'][number], realSpanDays: number): AxisGranularity {
  if (HAS_FINE_PERIOD[period] || HAS_INTRADAY_PERIOD[period]) return 'day';
  if (period === '7D' || period === '1M') return 'month';
  return realSpanDays >= YEAR_GRANULARITY_MIN_SPAN_DAYS ? 'year' : 'month';
}

function unitLabel(date: Date, granularity: AxisGranularity): string {
  if (granularity === 'day') return String(date.getUTCDate());
  if (granularity === 'month') return date.toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' });
  return String(date.getUTCFullYear());
}

// Target visible-tick COUNT (2026-08-22 third follow-up, direct
// feedback: reference keeps a roughly constant ~6-8 labels across every
// period, evenly spaced — "there's always six...about eight different
// units present," while ours showed as few as one or two once a period's
// data spanned few real unit-boundaries, e.g. 7D crossing only a single
// month).
const TARGET_TICK_COUNT = 7;

// EXPLICIT ticks, not a tickFormatter alone (2026-08-22 fourth follow-up
// — three formatter-only approaches were each tried and caught as real
// bugs before shipping, confirmed by tracing actual (value, index) calls
// live):
// 1. A stateful "compare to the last call" closure, and a precomputed
//    array keyed by array position — both assumed recharts calls the
//    formatter in one consistent, in-order, once-per-index pass.
//    Confirmed false: recharts calls the formatter during its own
//    tick-WIDTH MEASUREMENT pass (getTicks.js) as well as its later
//    RENDER pass (CartesianAxis.js), out of order and more than once per
//    index.
// 2. A slot-based "label the first index of each slot" pure function of
//    index alone — logically sound, but assumed recharts would actually
//    QUERY the exact slot-boundary indices. Confirmed false by directly
//    diffing the real queried-index set against the computed slot
//    boundaries live: recharts renders its OWN, separately-thinned tick
//    set (613 of 865 points queried for a real 1H series) that RARELY
//    lands on a precise boundary index (e.g. boundary 124 was never
//    queried at all; 120, 121, 125, 132 were) — no pure function of a
//    single queried index can reliably hit a target that index might
//    never actually take.
// The only architecturally sound fix: stop asking recharts to pick which
// ticks exist at all. XAxis's own `ticks` prop (AxisTick = number |
// string, confirmed via XAxis.d.ts) takes an explicit list of category
// values to render — recharts places exactly those, nothing else,
// eliminating the whole "will my formatter's index ever coincide with
// what got selected" class of bug. Once `ticks` pins the exact set,
// tickFormatter becomes safe again too: every value it's ever called
// with is now guaranteed to be one of those exact entries, so a plain
// stateless Map lookup (built alongside the same tick list) needs no
// ordering/index logic at all.
function buildExplicitTicks(
  orderedPoints: { x: string; date: Date }[],
  granularity: AxisGranularity,
): { ticks: string[]; shortLabels: Map<string, string> } {
  const count = orderedPoints.length;
  const picked: { x: string; date: Date }[] = [];
  if (count <= TARGET_TICK_COUNT) {
    picked.push(...orderedPoints);
  } else {
    const step = (count - 1) / (TARGET_TICK_COUNT - 1);
    for (let i = 0; i < TARGET_TICK_COUNT; i += 1) {
      const point = orderedPoints[Math.round(i * step)];
      if (point) picked.push(point);
    }
  }
  return {
    ticks: picked.map((point) => point.x),
    shortLabels: new Map(picked.map((point) => [point.x, unitLabel(point.date, granularity)])),
  };
}

function sliceByPeriod<T extends { t: string }>(
  series: T[],
  intraday: T[] | undefined,
  intradayFine: T[] | undefined,
  period: TrendChartProps['periods'][number],
): T[] {
  if (HAS_FINE_PERIOD[period] && intradayFine && intradayFine.length > 0) {
    return intradayFine;
  }
  if (HAS_INTRADAY_PERIOD[period] && intraday && intraday.length > 0) {
    return intraday;
  }
  const days = DAYS_BACK[period];
  if (days === 'all') return series;
  return series.slice(-days);
}

// time-series (TimeSeries.tsx) pairs multi-series rows POSITIONALLY, by
// array index against the first series' own x-values, and defaults any
// missing point to 0 (`line.points[index]?.y ?? 0`) — true/harmless for
// every existing usage (Phase 12's dual-line overlays, always identical
// date ranges), but wrong for a compareSeries that legitimately covers
// FEWER real dates than the primary's full history: found live, a
// 6-point monthly compare series against an 85-point daily primary
// rendered on the WRONG dates entirely (positional misalignment), and a
// naive date-realignment still degenerates to a fabricated flat-0 line
// for every date before the compare series' own first point (TimeSeries
// has no gap/connectNulls path to fall back on instead, and editing that
// shared, reused-not-rebuilt node is out of this phase's scope). The
// honest fix lives here instead: when a compareSeries is present, trim
// BOTH the primary and compare series to the compare series' own real
// coverage window — "price vs. this benchmark, over the period both
// actually have data," never a fabricated pre-benchmark value.
function trimToCompareCoverage<T extends { t: string }>(primary: T[], compare: T[]): T[] {
  if (compare.length === 0) return primary;
  const start = compare[0]?.t;
  const end = compare[compare.length - 1]?.t;
  if (!start || !end) return primary;
  return primary.filter((point) => point.t >= start && point.t <= end);
}

// New registry node extending time-series in spirit, delegating rendering
// to it directly (node-vocabulary.md, Phase 20) — owns period-toggle
// state, slices `series`/`compareSeries` client-side, then builds a
// SeriesDataSet payload time-series already knows how to render. Period
// toggle uses SegmentedControl ("controls a value, not a view" — its own
// doc comment — not TabList, which is page navigation).
const DEFAULT_PERIOD: TrendChartProps['periods'][number] = 'MAX';

// Principle 8 exception, named and scoped (Phase 21, 2026-08-15 ruling,
// node-vocabulary.md's own Phase 21 section): TrendChart's primary line/
// area-fill may render in --delta-up/--delta-down (chosen by the
// trend's own sign) instead of --accent-signal — ONE named node, ONE
// named context. TimeSeries.tsx itself stays on --accent-signal,
// unchanged (it's a bind node reused by scene-driven surfaces, out of
// this exception's scope) — achieved here by locally redefining the
// --accent-signal custom property for this component's own subtree only
// (inline style, the sanctioned per-instance CSS-custom-property escape
// hatch, same precedent as AnimatedListItem's own --item-index), not by
// editing TimeSeries.tsx.
function directionalColor(slicedPrimary: { price: number }[]): string {
  const first = slicedPrimary[0]?.price;
  const last = slicedPrimary[slicedPrimary.length - 1]?.price;
  if (first === undefined || last === undefined) return 'var(--accent-signal)';
  return last >= first ? 'var(--delta-up)' : 'var(--delta-down)';
}

// activePeriod/onPeriodChange (2026-08-30, direct feedback: move the
// period selector out of this component's own header row into
// AssetPriceHeader's price row instead, top-right, same line as the
// price/delta). Plain-TS extras, same precedent as TimeSeries.tsx's own
// xTicks/xTickFormatter: TrendChart is a literal-prop node with no
// scene-JSON usage, so an optional controlled-from-outside pair is safe
// here. Omitted (every existing story, every other caller) — component
// manages its own period state and renders its own header row exactly as
// before. Supplied (AssetOverviewTab.tsx) — the component becomes
// controlled and no longer renders a header row of its own at all; the
// caller is expected to render the SegmentedControl itself, elsewhere.
export function TrendChart({
  title,
  series,
  intraday,
  intradayFine,
  periods,
  compareSeries,
  hidePeriodSelector,
  bleedHeight,
  quiet,
  activePeriod: controlledPeriod,
  onPeriodChange,
}: TrendChartProps & {
  activePeriod?: TrendChartProps['periods'][number];
  onPeriodChange?: (period: TrendChartProps['periods'][number]) => void;
}) {
  const isControlled = controlledPeriod !== undefined && onPeriodChange !== undefined;
  const [internalPeriod, setInternalPeriod] = useState(periods.at(-1) ?? DEFAULT_PERIOD);
  const activePeriod = isControlled ? controlledPeriod : internalPeriod;
  const setActivePeriod = isControlled ? onPeriodChange : setInternalPeriod;

  const periodPrimary = sliceByPeriod(series, intraday, intradayFine, activePeriod);
  // Compare series carry no intraday/intradayFine array of their own
  // (schema unchanged — see tradableAsset.ts's own comment) — undefined
  // here always falls back to the daily 2-point read, same as the
  // pre-existing behavior; trimToCompareCoverage below already reconciles
  // resolution mismatches against whichever coverage window the compare
  // series actually has.
  const periodCompare = compareSeries?.map((compare) => ({
    ...compare,
    series: sliceByPeriod(compare.series, undefined, undefined, activePeriod),
  }));
  // Every registered compare series must share the SAME coverage window
  // (they're plotted against one shared x-axis) — trim to the narrowest
  // one present, not just the first, so a second compare series can't
  // silently reintroduce the same fabricated-zero problem.
  const slicedPrimary = (periodCompare ?? []).reduce((primary, compare) => trimToCompareCoverage(primary, compare.series), periodPrimary);

  // xTicks/xTickFormatter (2026-08-22, extended through the third and
  // fourth follow-ups): built fresh each render from slicedPrimary's own
  // real `t` values, in the SAME array order rows are handed to recharts
  // — see buildExplicitTicks's own comment for why both an explicit tick
  // list AND a formatter are needed together.
  const orderedPoints = slicedPrimary.map((point) => ({ x: formatAxisLabel(point.t), date: new Date(point.t) }));
  const firstDate = orderedPoints[0]?.date;
  const lastDate = orderedPoints[orderedPoints.length - 1]?.date;
  const realSpanDays = firstDate && lastDate ? (lastDate.getTime() - firstDate.getTime()) / 86_400_000 : 0;
  const { ticks: xTicks, shortLabels } = buildExplicitTicks(orderedPoints, granularityForPeriod(activePeriod, realSpanDays));
  const xTickFormatter = (value: string) => shortLabels.get(value) ?? value;

  const data: SeriesDataSet = {
    kind: 'series',
    series: [
      { id: 'primary', label: title ?? 'Price', points: slicedPrimary.map((point) => ({ x: formatAxisLabel(point.t), y: point.price })) },
      ...(periodCompare?.map((compare) => ({
        id: compare.label,
        label: compare.label,
        points: slicedPrimary.map((primaryPoint) => {
          const match = compare.series.find((point) => point.t === primaryPoint.t);
          return { x: formatAxisLabel(primaryPoint.t), y: match?.price ?? compare.series[compare.series.length - 1]?.price ?? 0 };
        }),
      })) ?? []),
    ].slice(0, 3),
  };

  const trendColor = directionalColor(slicedPrimary);
  // Auto-scaled Y domain for every zoomed period, not just 1H/24H
  // (broadened 2026-08-22, direct feedback: "south bow 7d 1m 1y look
  // similar flat" — the SAME root cause as 1H/24H's original flatness:
  // ChartBleedAxes' domain={[0, 'auto']} is a ratified, direct-feedback
  // design law ("the X-axis line should sit at Y=0"), correct for MAX
  // (the full ~85-day history, the one view that actually spans down
  // near the low end of that 0-baseline range) but wrong for any
  // narrower slice — a ~$40 price plotted against a 0-anchored axis
  // visually compresses real daily movement into a near-flat line
  // regardless of whether the underlying data is hourly or daily
  // resolution. Every period except MAX now requests the auto-scaled
  // domain; MAX alone keeps the 0-anchored axis this law described.
  const isZoomedPeriod = activePeriod !== 'MAX';

  return (
    // Pane-level glow (Phase 21 amendment, 2026-08-15): colored by the
    // SAME directional value as the chart line below, not --glow-color's
    // own --accent-signal default — "the glow should be of the color of
    // trend, not accent." Clipped (2026-08-16 follow-up, reversing the
    // prior day's own unclipped experiment): "chart bottom glow should
    // not overflow (go out the pane)" — contained to this component's own
    // pane, not bleeding past the enclosing Panel's border. --tint-subtle
    // (2026-08-17 follow-up, direct feedback: "subtler red/green [chart
    // gradient and glow]") — this chart's own glow is now ~50% less
    // opaque than glow.module.css's own --tint-strong default (KeyIssues-
    // Card's badges/panes are untouched, still --tint-strong).
    <div
      className={`${styles.root} ${bleedStyles.inline} ${bleedStyles.blockEnd}${quiet ? '' : ` ${glowStyles.root} ${glowStyles.bottom} ${glowStyles.clipped}`}`}
      {...(quiet ? {} : { style: { '--glow-color': trendColor, '--glow-strength': 'var(--tint-subtle)' } as React.CSSProperties })}
    >
      <div className={glowStyles.content}>
        {/* Header re-inset by exactly what the root above bled out
            (styles.headerInset) — the bleed applies to the WHOLE component
            rather than to the chart alone, which is what lets the glow's
            own .clipped containment and the chart's full-bleed coexist:
            previously .clipped sat on an ancestor BETWEEN .chartBleed and
            the pane edge and silently clipped the bleed back (measured
            live: chart reached 58→823, .clipped cut it to 74→807, exactly
            the 16px per side that read as "full bleed isn't working").
            Now nothing clips between the chart and the pane edge, because
            the clipping box IS the pane-edge box. */}
        {!isControlled && (title || !hidePeriodSelector) && (
          <div className={styles.headerInset}>
            <div className={styles.headerRow}>
              {title && <Text type="label">{title}</Text>}
              {!hidePeriodSelector && (
                <SegmentedControl label="Period" value={activePeriod} onChange={(value) => setActivePeriod(value as TrendChartProps['periods'][number])}>
                  {periods.map((period) => (
                    <SegmentedControlItem key={period} value={period} label={period} />
                  ))}
                </SegmentedControl>
              )}
            </div>
          </div>
        )}
        {/* --accent-signal redefined ONLY within this wrapper, not the whole
            component — SegmentedControlItem's own focus ring reads
            --color-accent (which itself resolves var(--accent-signal)
            lazily, at the point of use, following inheritance), so a
            component-wide override would have silently recolored the
            period toggle's focus ring too. Confirmed by reading
            SegmentedControlItem.tsx and each theme file's --color-accent
            bridge before scoping this narrowly. */}
        <div style={{ '--accent-signal': trendColor } as React.CSSProperties}>
          <TimeSeries
            data={data}
            bleed
            {...(bleedHeight !== undefined ? { bleedHeight } : {})}
            yAutoScale={isZoomedPeriod}
            xTicks={xTicks}
            xTickFormatter={xTickFormatter}
          />
        </div>
      </div>
    </div>
  );
}
