import { Card } from '@astryxdesign/core/Card';
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
export function AssetsHomeList({ rows }: { rows: AssetHomeRow[] }) {
  return (
    <div className={styles.list}>
      {rows.map((row) => (
        <Card key={row.entityId} className="panelFlat" padding={4}>
          <div className={styles.row}>
            <CoinLogo entityId={row.entityId} label={row.symbol} />
            <div className={styles.identity}>
              <Text type="body" weight="medium">
                {row.symbol}
              </Text>
              <TrendDelta value={row.deltaPercent} />
            </div>
            <div className={styles.valueColumn}>
              <Text type="body" weight="medium" hasTabularNumbers>
                ${row.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {row.quantity} {row.symbol}
              </Text>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
