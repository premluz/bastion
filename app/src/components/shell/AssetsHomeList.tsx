import { Item } from '@astryxdesign/core/Item';
import { Text } from '@astryxdesign/core/Text';
import { CoinLogo } from './CoinLogo';
import { TrendDelta } from '../nodes/TrendDelta';
import type { AssetHomeRow } from '../../engine/assetsHome';
import styles from './AssetsHomeList.module.css';

// Each holding is its own pane rather than a divider-separated list row
// (2026-09-12, direct feedback: "assets cards are panes we have styling
// for page so lets use it... no line separator"). Reuses the existing
// panelFlat treatment Panel.tsx already puts on Astryx Card — the app's
// established pane surface — instead of a bespoke card style, so these
// rows pick up every theme's own border/background automatically.
//
// Ticker only, no entity name: the symbol identifies the holding, and the
// name was redundant against a real brand mark. Delta sits under the
// ticker, quantity under the value, so each side reads as a stack.
//
// Card swapped for Item (2026-09-13, direct feedback: "should have hover
// the cards and are clickable"): Card/panelFlat carries no hover treatment
// anywhere in the theme cascade, so the prior version was visually a pane
// but not actually interactive. Item is the row primitive DiscoveryItemRow/
// Peers/Notable-Movers already use for "row that browses to a detail
// page" — passing onClick makes it render with real button semantics and
// picks up .astryx-item:hover's existing project-wide hover rule
// (theme.default.css) for free, no new CSS. className="panelFlat" layers
// the same pane look on top, same as Card did.
//
// onClick must be unconditional, not gated on the caller passing a handler
// (2026-09-13 follow-up): Item only renders as a real <button> — and only
// then does .astryx-item:hover fire — when isInteractive is true, which
// Astryx defines as onClick != null. An optional handler left undefined
// silently reproduced the exact "looks like a pane, isn't clickable" bug
// this change exists to fix. onSelectAsset is still optional for callers
// (AssetsHomePage always passes one today), but the row's own onClick
// always fires so hover/button semantics are never silently dropped.
export function AssetsHomeList({
  rows,
  selectedAssetId,
  onSelectAsset,
}: {
  rows: AssetHomeRow[];
  selectedAssetId?: string | null;
  onSelectAsset?: (entityId: string | null) => void;
}) {
  return (
    <div className={styles.list}>
      {rows.map((row) => (
        <Item
          key={row.entityId}
          className="panelFlat"
          density="balanced"
          isSelected={row.entityId === selectedAssetId}
          startContent={<CoinLogo entityId={row.entityId} label={row.symbol} />}
          label={
            <span className={styles.identity}>
              <Text type="body" weight="medium">
                {row.symbol}
              </Text>
              <TrendDelta value={row.deltaPercent} />
            </span>
          }
          endContent={
            <span className={styles.valueColumn}>
              <Text type="body" weight="medium" hasTabularNumbers>
                ${row.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {row.quantity} {row.symbol}
              </Text>
            </span>
          }
          onClick={() => onSelectAsset?.(row.entityId === selectedAssetId ? null : row.entityId)}
        />
      ))}
    </div>
  );
}
