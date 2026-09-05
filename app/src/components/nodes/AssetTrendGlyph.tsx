import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3line, area as d3area } from 'd3-shape';
import styles from './AssetTrendGlyph.module.css';

// One trend glyph for every "entity + trend" surface (2026-08-30, direct
// feedback: "we have 4 instances that are with the same parts... ensure we
// leverage this similarity in components and styling architecture / design
// system"). The four surfaces — Trending strip, Discover table, Discover
// card, Entity Detail — already shared AssetLogo/AssetIdentity/TrendDelta;
// the trend glyph was the one part that had diverged, with strip+table on
// the registry `Sparkline` node (flat --accent-signal, no gradient) and
// card+detail on the directional gradient treatment. This is that shared
// treatment, now used by strip, table, and card alike.
//
// The registry `Sparkline` node is deliberately NOT changed: it is scene-
// driven (Metric/DataTable render it from Scene JSON), so restyling it
// would change every scene-rendered chart too. This component is shell-
// only, same posture as AssetIdentity/TrendDelta beside it.
export type TrendGlyphVariant = 'inline' | 'block';

interface AssetTrendGlyphProps {
  isUp: boolean;
  // 'inline' — fixed 80x24, for a table cell or list row (replaces the
  // registry Sparkline's own footprint exactly, so no slot has to resize).
  // 'block' — fills its container's width, taller, for a card's own
  // full-bleed chart area.
  variant: TrendGlyphVariant;
  // Real series, when the surface has one (strip/table rows carry genuine
  // sparklinePoints). Omitted for surfaces with no real series wired up,
  // where `seed` drives a deterministic generated walk instead — the
  // architect's own ruling for the card grid: "no need [for real] data
  // points to hold," randomly generated is fine for a passing-trend glyph.
  points?: { x: string; y: number }[];
  // Stable per-entity seed for the generated fallback walk. Required only
  // when `points` is absent.
  seed?: string;
}

// Direction from the series itself — for surfaces whose rows carry no
// momentum percentage of their own (bonds/real-estate/credit-fund rows,
// which have no comparable 24h delta; see DiscoveryRow's own comment).
// First-to-last, the same reading TrendChart's own directionalColor uses.
export function seriesIsUp(points: { y: number }[]): boolean {
  const first = points[0]?.y;
  const last = points[points.length - 1]?.y;
  if (first === undefined || last === undefined) return true;
  return last >= first;
}

const INLINE_WIDTH = 80;
const INLINE_HEIGHT = 24;
const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 64;
// Vertical breathing room only, in viewBox units — keeps the 1.5px stroke's
// own half-width from being clipped at the series' highest/lowest points.
// There is deliberately NO horizontal inset (2026-08-30, direct feedback:
// the pane bled correctly but the path inside it did not, measured at
// 272.32px in a ~325px box): the x-scale runs the full 0→WIDTH so the line
// and its area fill reach both edges. An inset in viewBox units is also
// magnified by preserveAspectRatio="none" — at a card's real width the old
// 2-unit x-inset rendered as ~7px per side, not 2px.
const Y_INSET = 2;
const GENERATED_POINT_COUNT = 48;

// Deterministic per-entity PRNG (mulberry32, seeded from the asset id) — a
// stable-looking wiggle that doesn't reshuffle on every re-render.
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

function generateWalk(seed: string, isUp: boolean): number[] {
  const random = seededRandom(seed);
  const drift = isUp ? 0.6 : -0.6;
  let value = 50;
  const values = [value];
  for (let i = 1; i < GENERATED_POINT_COUNT; i += 1) {
    value += (random() - 0.5) * 8 + drift;
    values.push(value);
  }
  return values;
}

// Walks up from an element to the nearest ancestor that actually scrolls
// (computed overflow-y: auto|scroll) — IntersectionObserver's `root`
// option needs the REAL scroll container, not the browser viewport, in an
// app whose own pages scroll an inner pane rather than the window. null
// (IntersectionObserver's own "use the viewport" default) only as a last
// resort, for the rare case a glyph somehow renders with no scrolling
// ancestor at all.
function findScrollableAncestor(el: Element): Element | null {
  let node: Element | null = el.parentElement;
  while (node) {
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

// vectorEffect="non-scaling-stroke" (2026-08-30): the viewBox renders far
// smaller than a card actually draws it, so a plain strokeWidth in viewBox
// units gets scaled UP with everything else (measured live: a ~300px-wide
// card stretched a nominal 1.5 stroke to ~4.5px, visibly heavier than
// TimeSeries' real 1.5px-at-1:1 line). This pins the stroke at its literal
// 1.5px regardless of viewBox scaling, matching every other chart in the app.
export function AssetTrendGlyph({ isUp, variant, points, seed }: AssetTrendGlyphProps) {
  const gradientId = useId();
  // Callback ref stored in state, not a plain useRef (2026-08-31 real bug,
  // caught live: a plain ref's own effect, deps [], can run once BEFORE
  // React has attached the DOM node — confirmed live via instrumentation,
  // ~1 in 85 glyphs on a real Discover grid render permanently stuck with
  // no IntersectionObserver ever constructed for them, no re-check once
  // the ref did attach, since [] deps meant the effect only ever got one
  // chance). A state-backed ref re-renders (and re-runs any effect keyed
  // on it) the instant React actually attaches the node, closing that
  // window entirely rather than reducing its odds.
  const [svgEl, setSvgEl] = useState<SVGSVGElement | null>(null);
  const linePathRef = useRef<SVGPathElement>(null);
  // Real path length, measured in the DOM (2026-08-31 follow-up — left-
  // to-right reveal, extended from TimeSeries.tsx's own chart to this
  // node's hand-drawn d3 path). getTotalLength() is the only correct
  // source: a fixed guess in viewBox units would be wrong per-instance,
  // since every glyph's own random/real wiggle has a different real path
  // length. undefined until measured, so the line renders solid (no
  // dasharray) for the one frame before the effect runs rather than
  // flashing an unstyled/invisible state.
  //
  // Scaled by the SVG's own render-width/viewBox-width ratio (2026-08-31
  // second follow-up, real bug caught from a live screenshot: "chart line
  // is cut off, gap in middle or not running to end" on nearly every
  // card). Root cause: vectorEffect="non-scaling-stroke" below draws the
  // stroke — and per the SVG spec, its dash pattern along with it — in
  // SCREEN pixels once the coordinate system is scaled, but
  // getTotalLength() always returns length in the path's own USER-SPACE
  // (viewBox) units. A 'block' glyph's viewBox is a fixed 100 units wide
  // while a real card renders it at ~300-450px (preserveAspectRatio=
  // "none", full-bleed width) — confirmed live via getBoundingClientRect
  // vs. viewBox.baseVal.width: a real card measured scaleX ≈ 3.565. The
  // raw user-space length (e.g. 247.8) was being set as the on-screen
  // dasharray directly, so the "full line" dash segment was ~3.5x too
  // short relative to the actual painted path — reading as the line
  // stopping short or gapping partway, exactly where the real dash
  // repeat happened to fall. 'inline' glyphs (fixed 80px width, no
  // container-driven scaling) are unaffected in practice, but the same
  // scale correction is applied uniformly rather than special-cased,
  // since it is a no-op there (scaleX ≈ 1).
  const [lineLength, setLineLength] = useState<number | undefined>(undefined);
  // Fires the reveal on actual viewport entry, not bare mount (2026-08-31
  // second follow-up, direct feedback: "trigger animation as item enters
  // viewport or is on landing") — a card mounted off-screen (below the
  // fold in a long Discover grid) previously played its draw-on
  // invisibly and just appeared fully-drawn once scrolled into view.
  // IntersectionObserver, one-shot (disconnects on first intersection,
  // same "reveal once" semantics the renderer's own scene-assembly
  // stagger already has — this isn't a repeating scroll-loop animation).
  // A glyph that's already on-screen at mount (Home's own landing state,
  // or the top of a fresh page load) still animates immediately, since
  // IntersectionObserver's own first callback fires as soon as it starts
  // observing an already-intersecting element — no separate "is this
  // already visible" branch needed.
  const [isVisible, setIsVisible] = useState(false);
  const color = isUp ? 'var(--delta-up)' : 'var(--delta-down)';
  const isInline = variant === 'inline';
  const width = isInline ? INLINE_WIDTH : BLOCK_WIDTH;
  const height = isInline ? INLINE_HEIGHT : BLOCK_HEIGHT;

  const paths = useMemo(() => {
    const values = points && points.length >= 2 ? points.map((point) => point.y) : seed ? generateWalk(seed, isUp) : [];
    if (values.length < 2) return undefined;

    const xScale = scaleLinear().domain([0, values.length - 1]).range([0, width]);
    const yScale = scaleLinear().domain([Math.min(...values), Math.max(...values)]).range([height - Y_INSET, Y_INSET]);

    const line = d3line<number>()
      .x((_value, index) => xScale(index))
      .y((value) => yScale(value))(values);

    // Area baseline is the true bottom edge, not the line's own Y_INSET
    // floor — the fill should reach the container's bottom edge even though
    // the stroke stops just short of it.
    const area = d3area<number>()
      .x((_value, index) => xScale(index))
      .y0(height)
      .y1((value) => yScale(value))(values);

    return line && area ? { line, area } : undefined;
  }, [points, seed, isUp, width, height]);

  // Re-measures whenever the path's own `d` changes (a new series, a new
  // generated walk) AND whenever the SVG's own rendered width changes
  // (ResizeObserver) — a card grid reflows on viewport resize/theme
  // switch, and the scale-corrected length above depends on that live
  // width, not just the path shape.
  useEffect(() => {
    if (!svgEl) return;
    const measure = () => {
      const pathEl = linePathRef.current;
      if (!pathEl) return;
      const userLength = pathEl.getTotalLength();
      const scaleX = svgEl.clientWidth / width;
      setLineLength(userLength * scaleX);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(svgEl);
    return () => observer.disconnect();
  }, [svgEl, paths?.line, width]);

  useEffect(() => {
    if (!svgEl) return;
    // root: the nearest scrollable ancestor, not the browser viewport
    // (IntersectionObserver's own root:null default) — this app scrolls
    // an INNER pane (PageShell's .paneScroll, ScrollAnchor's own .scroll),
    // never the window itself, so root:null's "viewport" bounding box
    // always includes the whole page regardless of the pane's own scroll
    // offset. Confirmed live before shipping: every glyph reported
    // isIntersecting:false forever with root:null, even ones genuinely
    // on-screen inside the pane — findScrollableAncestor walks up via
    // computed overflow-y, same "find the real scroll container" problem
    // this app's other scroll-aware code (usePaneFitCollapse.ts,
    // ScrollAnchor.tsx's own useScrollIntoViewOnGrow) has each solved in
    // their own local way; this is the sparkline's own version of that,
    // generic across whichever pane it happens to render inside (Discover,
    // chat transcript, a table cell) rather than hardcoding one class.
    const root = findScrollableAncestor(svgEl);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { root, threshold: 0.1 },
    );
    observer.observe(svgEl);
    return () => observer.disconnect();
  }, [svgEl]);

  // Fewer than two points renders nothing rather than a placeholder — an
  // EmptyState has no sensible reading inline next to a number or in a
  // table cell (the same deliberate exception the registry Sparkline node's
  // own doc comment already records for principle 6).
  if (!paths) return null;

  // Three real states, not two: (1) lineLength not measured yet — render
  // plain, no class, no --reveal-line-length (avoids an unstyled
  // dasharray:0 collapsing the line to nothing for that one frame);
  // (2) measured but not yet visible — .pendingLine/.pendingArea hold the
  // hidden `from`-keyframe state statically, so an off-screen glyph is
  // ready-but-invisible, never solid; (3) visible — .revealLine/.revealArea
  // run the actual draw-on animation exactly once (isVisible only ever
  // flips true→stays true, per the IntersectionObserver's own one-shot
  // disconnect above).
  const isMeasured = lineLength !== undefined;
  const lineClassName = isMeasured ? (isVisible ? styles.revealLine : styles.pendingLine) : undefined;
  const areaClassName = isMeasured ? (isVisible ? styles.revealArea : styles.pendingArea) : undefined;

  return (
    <svg
      ref={setSvgEl}
      {...(isInline ? { width: INLINE_WIDTH } : { width: '100%' })}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Trend glyph"
      className={styles.chart}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} style={{ stopOpacity: 'var(--tint-subtle)' }} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={paths.area} fill={`url(#${gradientId})`} className={areaClassName} />
      <path
        ref={linePathRef}
        d={paths.line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        className={lineClassName}
        style={isMeasured ? ({ '--reveal-line-length': lineLength } as React.CSSProperties) : undefined}
      />
    </svg>
  );
}
