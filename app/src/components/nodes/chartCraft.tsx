import { Fragment } from 'react';
import { ReferenceLine, XAxis, YAxis } from 'recharts';
import { Text } from '@astryxdesign/core/Text';
import type { TooltipContentProps } from 'recharts';
import type { TimeSeriesProps } from '../../contracts/props/time-series';

// Shared recharts craft primitives (Phase 8E) — NOT a registry node, just
// plain reuse between time-series and bar-series, same precedent as
// StatusTag being imported directly by EntityHeader. Kept here rather
// than duplicated in each chart component.

export function TabularTick({
  x,
  y,
  payload,
  textAnchor,
  dx,
  dy,
  fill,
  index,
  tickFormatter,
}: {
  x?: number;
  y?: number;
  payload?: { value: string | number };
  textAnchor: 'start' | 'middle' | 'end';
  dx: number;
  dy: number;
  // Default --ink-muted reads fine against a chart's plain background
  // (every existing outside-axis usage); TrendChart's bleed mode layers
  // the tick INSIDE the plot area, directly over the area-fill gradient —
  // --ink-muted's own contrast there was confirmed too low live (Phase
  // 21 follow-up), so that one caller passes --ink-primary instead.
  fill?: string;
  // index/tickFormatter (2026-08-22): recharts passes BOTH of these
  // through to a custom `tick` element automatically (CartesianAxis's own
  // tickProps), but — confirmed by reading CartesianAxis.js directly —
  // only applies tickFormatter to `payload.value` ITSELF when `tick` is a
  // function or omitted; when `tick` is a JSX element (this component's
  // own usage everywhere), recharts clones it with the RAW, unformatted
  // payload and expects the element to call tickFormatter itself. Without
  // this, a caller-supplied tickFormatter (TrendChart.tsx's own tick-
  // thinning logic) was silently never applied — confirmed live, every
  // tick rendered its full raw label regardless.
  index?: number;
  tickFormatter?: (value: string, index: number) => string;
}) {
  const rawValue = payload?.value;
  const value = tickFormatter && rawValue !== undefined ? tickFormatter(String(rawValue), index ?? 0) : rawValue;
  // Axis ticks are annotation, not UI chrome — both axes read as data
  // (dates, categories, numerals), so both get the data face + tabular
  // alignment, not just the numeric (Y) axis.
  return (
    <text
      x={(x ?? 0) + dx}
      y={(y ?? 0) + dy}
      fill={fill ?? 'var(--ink-muted)'}
      fontSize={11}
      fontFamily="var(--face-data)"
      textAnchor={textAnchor}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {value}
    </text>
  );
}

// Extracted from TimeSeries.tsx (2026-08-17, over the 200-line file
// budget once the axis dy/domain fixes landed) — the X/Y axis pair
// TimeSeries renders, both branching on `bleed`, kept together since
// they must stay siblings under the SAME <ComposedChart> and their own
// tuning is genuinely coupled (see comments below).
//
// XAxis bleed: ticks render INSIDE the plot area near the bottom edge
// (dy negative, pulling the label up off the axis line) rather than
// hidden entirely (a prior round's own choice, reversed 2026-08-15:
// "still can't see bottom axis") — same "numbers on the inner side"
// convention as YAxis below. axisLine/tickLine off, matching YAxis's own
// bleed treatment.
//
// YAxis bleed: axis reserves near-zero width, ticks render INSIDE the
// plot area (textAnchor="start", positive dx) — "numbers on the inner
// side, no left padding" (Phase 21). width=1, not 0: recharts'
// CartesianAxis bails out entirely (ticks included) once width<=0 (its
// own source: `if (width <= 0) return null`), confirmed live (zero
// <text> nodes at width=0). --ink-primary, not --ink-muted: the inner
// tick sits over the area-fill gradient, and --ink-muted's own contrast
// there was confirmed too low live. dx=24: the SVG sits flush against
// the enclosing Panel's own rounded corner once bled edge-to-edge
// (chartBleed's negative margin, --radius-container 12px), and a tick
// inside that corner's clip arc silently failed to paint in real
// screenshots despite correct computed style — the safe threshold
// depends on the tick's own y and label width (digit count), confirmed
// live across two fixtures (South Bow Corp's 15/30/45/60 needed less
// clearance than Zenith Protocol's 2/4/6/8) before landing on 24.
//
// domain={[0, 'auto']}: recharts' default domain auto-scales to the
// data's own min/max, so the X-axis (drawn at the domain's floor) sat
// wherever the lowest price happened to be, not at Y=0 — direct
// feedback (2026-08-17): "x axis horizontal at same level as 0 from
// vertical." Forcing the floor to 0 makes the X-axis line and the "0"
// Y-tick the same line, by construction.
//
// Both ticks' dy MATCHED (X: -8, Y: 0) — follow-up, 2026-08-17: "still
// 12px lower." Measured live that the "0" label's own top sat 12px
// below the date row's top despite sharing the same y-coordinate — each
// tick had its OWN independently-tuned dy (Y was 12) fighting the
// other. Dropping Y's dy to 0 closed the gap, reconfirmed post-fix.
//
// Default (bleed=false) keeps every existing usage's outside-axis look,
// --ink-muted color, and auto-scaled domain unchanged — scoped to bleed
// only (TrendChart/Entity Detail's own presentation; other charts read
// fine auto-scaled and weren't asked to change). yAutoScale (2026-08-22):
// switches the bleed-mode Y domain from [0, 'auto'] to ['auto', 'auto']
// — see TimeSeriesProps's own comment for why a 0-anchored domain visually
// flattens a tight-range window (TrendChart's intraday periods).
// xTicks/xTickFormatter (2026-08-22 follow-up): passed straight through
// to recharts' own XAxis `ticks`/`tickFormatter` props — see
// TimeSeries.tsx's own comment for why these are plain TS additions, not
// part of TimeSeriesProps. undefined here is simply recharts' own
// default (auto-select ticks; render each one's raw category value), so
// every existing caller that doesn't pass either is unaffected.
// Airy X band: height of the axis strip under the plot, and how far its labels
// sit below the plot's bottom edge.
export const AIRY_X_AXIS_HEIGHT = 44;
const AIRY_X_TICK_DY = 16;

export function ChartBleedAxes({
  bleed,
  rightAxisSeriesId,
  yAutoScale,
  xTicks,
  xTickFormatter,
  airy,
}: Pick<TimeSeriesProps, 'bleed' | 'rightAxisSeriesId' | 'yAutoScale'> & {
  xTicks?: string[];
  xTickFormatter?: (value: string, index: number) => string;
  // Airy axes (2026-10-09, direct feedback on the Portfolio chart): no Y
  // values at all, and a taller X band whose labels sit well below the plot
  // instead of hugging its edge.
  airy?: boolean;
}) {
  return (
    <Fragment>
      <XAxis
        dataKey="x"
        {...(xTicks ? { ticks: xTicks } : {})}
        {...(xTickFormatter ? { tickFormatter: xTickFormatter } : {})}
        {...(bleed
          ? {
              axisLine: false,
              tickLine: false,
              // dy 8 (2026-08-22 direct feedback: "bottom scale... numbers
              // should be 16px lower") — was -8; +16 from that value per
              // the ask, not a re-derived number.
              tick: <TabularTick textAnchor="middle" dx={0} dy={airy ? AIRY_X_TICK_DY : 8} fill="var(--ink-primary)" />,
              ...(airy ? { height: AIRY_X_AXIS_HEIGHT } : {}),
            }
          : { tick: <TabularTick textAnchor="middle" dx={0} dy={12} /> })}
      />
      <YAxis
        yAxisId="left"
        {...(airy ? { hide: true } : {})}
        {...(bleed
          ? {
              width: 1,
              axisLine: false,
              tickLine: false,
              domain: yAutoScale ? ['auto', 'auto'] : [0, 'auto'],
              tick: <TabularTick textAnchor="start" dx={24} dy={0} fill="var(--ink-primary)" />,
            }
          : { tick: <TabularTick textAnchor="end" dx={-4} dy={4} /> })}
      />
      {rightAxisSeriesId && <YAxis yAxisId="right" orientation="right" tick={<TabularTick textAnchor="end" dx={16} dy={4} />} />}
    </Fragment>
  );
}

// Extracted from TimeSeries.tsx (2026-08-17, over the 200-line file
// budget once the glow prop landed) — TimeSeries's own two fixes stay
// documented here since they moved with the code: (1) yAxisId="left" —
// once a chart carries a named axis, recharts can't resolve which axis a
// ReferenceLine without one belongs to and silently drops it. (2)
// ifOverflow="extendDomain" — the default numeric domain is sized to the
// plotted series' own data, so a threshold above that range still
// wouldn't render without telling recharts to widen the axis to fit it.
// referenceLines are horizontal thresholds; annotations are vertical
// event markers (e.g. a failure date) — two distinct, narrowly-typed
// shapes rather than one generic "marker" union, since a threshold is
// context and a named event is a fact (different registers).
export function ChartReferenceLines({
  referenceLines,
  annotations,
}: Pick<TimeSeriesProps, 'referenceLines' | 'annotations'>) {
  return (
    <Fragment>
      {referenceLines?.map((ref) => (
        <ReferenceLine
          key={ref.value}
          yAxisId="left"
          y={ref.value}
          ifOverflow="extendDomain"
          stroke="var(--ink-muted)"
          strokeDasharray="3 3"
          {...(ref.label ? { label: { value: ref.label, position: 'insideTopRight', fill: 'var(--ink-muted)', fontSize: 10 } } : {})}
        />
      ))}
      {annotations?.map((annotation) => (
        <ReferenceLine
          key={annotation.x}
          yAxisId="left"
          x={annotation.x}
          stroke="var(--accent-alert)"
          strokeDasharray="2 2"
          label={{ value: annotation.label, position: 'top', fill: 'var(--accent-alert)', fontSize: 10 }}
        />
      ))}
    </Fragment>
  );
}

export function TokenTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--edge)',
        borderRadius: 'var(--radius-4)',
        padding: 'var(--space-8)',
        display: 'grid',
        gap: 'var(--space-4)',
      }}
    >
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      {payload.map((entry) => (
        <div key={entry.dataKey as string} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-16)' }}>
          <Text type="supporting">{entry.name}</Text>
          <Text type="supporting" hasTabularNumbers>
            {entry.value}
          </Text>
        </div>
      ))}
    </div>
  );
}
