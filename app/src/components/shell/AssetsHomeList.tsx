import { List, ListItem } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';
import { CoinLogo } from './CoinLogo';
import { TrendDelta } from '../nodes/TrendDelta';
import type { AssetHomeRow } from '../../engine/assetsHome';
import styles from './AssetsHomeList.module.css';

// Coin logo + symbol + delta badge start slot, fiat value + quantity end
// slot — ListItem's own start/end content slots (same primitive
// HoldingsPage's "Connect a wallet" list already uses), not a bespoke row
// component, since ListItem already provides the hover/press/divider
// treatment this page wants for free.
export function AssetsHomeList({ rows }: { rows: AssetHomeRow[] }) {
  return (
    <List hasDividers density="compact">
      {rows.map((row) => (
        <ListItem
          key={row.entityId}
          startContent={<CoinLogo entityId={row.entityId} label={row.symbol} />}
          label={
            <span className={styles.symbolRow}>
              <Text type="body" weight="medium">
                {row.symbol}
              </Text>
              <TrendDelta value={row.deltaPercent} />
            </span>
          }
          description={row.name}
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
        />
      ))}
    </List>
  );
}
