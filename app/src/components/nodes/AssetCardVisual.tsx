import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { AssetTrendGlyph } from './AssetTrendGlyph';
import { AssetIdentity } from './AssetIdentity';
import { TrendDelta } from './TrendDelta';
import styles from './AssetCardVisual.module.css';

// Plain, engine-agnostic row shape — deliberately NOT MarketAsset
// (engine/assetDiscovery.ts). This component is shared by EntityAssetGrid.tsx
// (a shell component, free to import from engine/) AND the asset-card-grid
// REGISTRY node (nodes/AssetCardGrid.tsx, which may never import from engine/
// per CLAUDE.md rule 3) — so its own props can only be primitives, never an
// engine type. Each caller maps its own data onto this shape at the call
// site; this component itself doesn't know or care which one is calling.
export interface AssetCardVisualRow {
  id: string;
  name: string;
  type: string;
  // Pre-formatted by the caller (either "$1,234.56" or "5.8%") — this
  // component has no opinion on price vs. yield formatting, same reason
  // it takes no category enum.
  formattedValue: string;
  deltaPercent: number;
}

// Extracted (Phase 21, 2026-08-30) from EntityAssetGrid.tsx's own
// AssetCardContent so the SAME card visual can be driven two ways: directly
// by EntityAssetGrid (Discover page, callback-driven click) and by the new
// asset-card-grid registry node (Scene-JSON-driven, inline-in-transcript
// results, data-attribute click per rule 7) — "one card system serves both
// human browsing and assistant generation," CLAUDE.md's own Phase 21 law.
// Purely presentational: no click handler of its own, no onClick prop —
// each caller wraps this in whatever clickable container its own rules
// allow (ClickableCard+onClick for the shell component, a plain
// data-entity-id div for the registry node).
//
// 1. Outer card is --surface-1 with a subtle --edge border (cardSurface1,
//    theme.default.css et al.). Identity sits directly on that surface,
//    inside the border — but the caller owns the outer card/border, not
//    this component (see AssetCardGrid.tsx / EntityAssetGrid.tsx).
// 2. Chart+price live inside their own sub-pane, genuinely borderless/
//    full-bleed/transparent (styles.chartPane), reading as part of the
//    outer surface-1 card rather than a second nested card.
// 3. Price/delta sits in its OWN row, ABOVE the chart, left-aligned to the
//    same inset as the identity row above it (styles.priceInset) — the
//    chart then fills the rest of the pane edge-to-edge.
//
// Delta reads as a bare percentage — no dollar figure (that survives only
// on Entity Detail's own price header, which has the room for it).
export function AssetCardVisual({ id, name, type, formattedValue, deltaPercent }: AssetCardVisualRow) {
  return (
    <div className={styles.cardContent}>
      <AssetIdentity id={id} name={name} type={type} />
      <Card variant="default" padding={0} className={styles.chartPane ?? ''}>
        <div className={styles.priceInset}>
          <Text type="large" weight="semibold" hasTabularNumbers display="block">
            {formattedValue}
          </Text>
          <TrendDelta value={deltaPercent} />
        </div>
        <AssetTrendGlyph variant="block" seed={id} isUp={deltaPercent >= 0} />
      </Card>
    </div>
  );
}
