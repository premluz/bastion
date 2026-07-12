import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { ConcentrationMapProps } from '../../contracts/props/concentration-map';

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 50;
const CELL_PADDING = 0.4;
const MIN_TEXT_HEIGHT = 6;
const MIN_VALUE_HEIGHT = 12;
const LABEL_FONT_SIZE = 3.2;
const VALUE_FONT_SIZE = 4;
// Rough proportional-font average character width, as a fraction of
// font size — used only to decide how much of a label fits before
// ellipsizing, not for exact typography.
const CHAR_WIDTH_FACTOR = 0.55;

interface Row {
  label: string;
  value: number;
}

interface TreeDatum {
  children?: Row[];
  label?: string;
  value?: number;
}

interface Cell {
  label: string;
  valueLabel: string;
  isHighlighted: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
}

// Fits text to a cell width by ellipsizing, never by silent mid-word
// clipping — a clipPath still backstops this (belt and suspenders: the
// estimate below is approximate, the clipPath guarantees no bleed even
// if the estimate is off). Returns null when even one character plus an
// ellipsis can't fit, so the caller falls back to rect + <title> only.
function fitText(text: string, maxWidth: number, fontSize: number): string | null {
  const charWidth = fontSize * CHAR_WIDTH_FACTOR;
  const maxChars = Math.floor((maxWidth - 4) / charWidth);
  if (maxChars <= 0) return null;
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return null;
  return `${text.slice(0, maxChars - 1)}…`;
}

// "What dominates this whole?" — a weighted treemap, laid out by
// d3-hierarchy's real squarify algorithm (math only — rendering stays
// hand-rolled SVG + tokens, per Phase 8E). Sorted descending by value —
// supersedes Phase 8D's "authored data order preserved" law, which was a
// property of the old hand-rolled algorithm, not a requirement of the
// data itself; squarify's own aspect-ratio quality assumes descending
// input, and unsorted input visibly read worse live (the largest slice
// no longer looked dominant). Muted single-hue scale for every cell;
// --accent-signal reserved for the one cell (if any) the scene
// explicitly names via highlightValue — never used for market red/green
// (this node encodes share, not performance, principle 8).
export function ConcentrationMap({ title, data, labelColumn, valueColumn, valueSuffix, highlightValue }: ConcentrationMapProps) {
  const rows: Row[] = data.rows
    .map((row) => {
      const rawLabel = row[labelColumn];
      const rawValue = row[valueColumn];
      const value = typeof rawValue === 'number' ? rawValue : Number(rawValue);
      return { label: rawLabel != null ? String(rawLabel) : '', value };
    })
    .filter((row) => row.label.length > 0 && Number.isFinite(row.value) && row.value > 0);

  if (rows.length === 0) {
    return <EmptyState title="No proportions to show" description="No positive values found for this breakdown." />;
  }

  // Sorted descending by value, per d3-hierarchy's own documented guidance
  // ("you probably also want to call root.sort... before computing the
  // layout") — squarify's aspect-ratio quality assumes descending input;
  // tried without sorting first and it visibly produced a worse layout
  // live (the largest slice, 61%, no longer read as dominant). Highlight
  // matching is unaffected — it keys off row.label, not position, so
  // "authored data order" only ever governed the old hand-rolled layout,
  // never anything about the underlying table data itself.
  const root = hierarchy<TreeDatum>({ children: rows }, (d) => d.children ?? null)
    .sum((d) => d.value ?? 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const laidOut = treemap<TreeDatum>().size([VIEW_WIDTH, VIEW_HEIGHT]).tile(treemapSquarify).paddingInner(CELL_PADDING)(root);

  // All-rows invariant: every filtered row becomes exactly one leaf —
  // hierarchy() never drops a child, so `cells.length === rows.length`
  // always holds (asserted directly in ConcentrationMap.test.tsx).
  const cells: Cell[] = laidOut.leaves().map((leaf) => {
    const row = leaf.data as Row;
    return {
      label: row.label,
      valueLabel: `${row.value}${valueSuffix ?? ''}`,
      isHighlighted: row.label === highlightValue,
      x: leaf.x0,
      y: leaf.y0,
      w: leaf.x1 - leaf.x0,
      h: leaf.y1 - leaf.y0,
    };
  });

  return (
    <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
      {title && <Text type="label">{title}</Text>}
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        width="100%"
        style={{ aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}`, display: 'block' }}
        role="img"
        aria-label={title ?? 'Concentration map'}
      >
        {cells.map((cell, index) => {
          const canShowText = cell.h > MIN_TEXT_HEIGHT;
          const fittedLabel = canShowText ? fitText(cell.label, cell.w, LABEL_FONT_SIZE) : null;
          // Value hides before name: only attempted once the name itself
          // is showing and there's still vertical room for a second line.
          const canShowValue = fittedLabel !== null && cell.h > MIN_VALUE_HEIGHT;
          const clipId = `concentration-cell-${index}`;
          return (
            <g key={cell.label}>
              <clipPath id={clipId}>
                <rect x={cell.x} y={cell.y} width={cell.w} height={cell.h} />
              </clipPath>
              <rect
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                fill="var(--surface-2)"
                stroke={cell.isHighlighted ? 'var(--accent-signal)' : 'var(--edge)'}
                strokeWidth={cell.isHighlighted ? 0.6 : 0.3}
              >
                {/* Every row stays discoverable via native hover/focus even
                    when too small to carry visible text — the all-rows
                    invariant isn't just "a rect exists," it's "a person can
                    always find out what this cell is." */}
                <title>{`${cell.label}: ${cell.valueLabel}`}</title>
              </rect>
              {fittedLabel !== null && (
                <g clipPath={`url(#${clipId})`}>
                  <text
                    x={cell.x + 2}
                    y={cell.y + 5}
                    fontSize={LABEL_FONT_SIZE}
                    fontFamily="var(--face-ui)"
                    fill={cell.isHighlighted ? 'var(--accent-signal)' : 'var(--ink-primary)'}
                  >
                    {fittedLabel}
                  </text>
                  {canShowValue && (
                    <text
                      x={cell.x + 2}
                      y={cell.y + 10}
                      fontSize={VALUE_FONT_SIZE}
                      fontFamily="var(--face-data)"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                      fill="var(--ink-secondary)"
                    >
                      {cell.valueLabel}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
