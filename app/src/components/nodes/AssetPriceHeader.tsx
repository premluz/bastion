import type { ReactNode } from 'react';
import { Text } from '@astryxdesign/core/Text';
import { Timestamp } from '@astryxdesign/core/Timestamp';
import type { AssetPriceHeaderProps } from '../../contracts/props/asset-price-header';
import styles from './AssetPriceHeader.module.css';

function formatDelta(abs: number, pct: number): string {
  const sign = abs >= 0 ? '+' : '';
  return `${sign}${abs.toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
}

// "What is this asset worth right now, and how has that changed?"
// (node-vocabulary.md, Phase 20) — last price, signed delta, an optional
// after-hours read, today's range, read as one glance-able unit. A plain
// directional color on the delta (ok/alert) is a fact, not a CTA —
// principle 2's own line, restated in this section's own non-goal note.
//
// periodSelector (2026-08-30, direct feedback: move TrendChart's period
// selector to top-right, same row as the price/delta) — a plain-TS extra
// prop alongside the Zod-typed ones, same precedent as TimeSeries.tsx's
// own xTicks/xTickFormatter: this node IS registered (registry.ts), but
// carries no scene-JSON usage today, and a ReactNode can never be
// Zod/JSON-validated, so it stays out of AssetPriceHeaderPropsSchema and
// is only ever supplied by a literal React caller (AssetOverviewTab.tsx),
// never by the registry/bind path.
export function AssetPriceHeader({
  lastPrice,
  changeAbs,
  changePct,
  asOf,
  afterHours,
  dayRange,
  periodSelector,
}: AssetPriceHeaderProps & { periodSelector?: ReactNode }) {
  const isUp = changeAbs >= 0;
  return (
    <div className={styles.root}>
      <div className={styles.priceRow}>
        <div className={styles.priceRowStart}>
          <Text type="display-2" hasTabularNumbers>
            ${lastPrice.toFixed(2)}
          </Text>
          <Text type="body" weight="medium" hasTabularNumbers className={isUp ? styles.deltaOk : styles.deltaAlert}>
            {formatDelta(changeAbs, changePct)}
          </Text>
        </div>
        {periodSelector}
      </div>
      <div className={styles.metaRow}>
        <Text type="supporting" color="secondary">
          As of <Timestamp value={asOf} format="date" />
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Day range ${dayRange[0].toFixed(2)} – ${dayRange[1].toFixed(2)}
        </Text>
      </div>
      {afterHours && (
        <div className={styles.afterHoursRow}>
          <Text type="supporting" color="secondary">
            After hours
          </Text>
          <Text type="body" hasTabularNumbers>
            ${afterHours.price.toFixed(2)}
          </Text>
          <Text
            type="supporting"
            hasTabularNumbers
            className={afterHours.changeAbs >= 0 ? styles.deltaOk : styles.deltaAlert}
          >
            {formatDelta(afterHours.changeAbs, afterHours.changePct)}
          </Text>
        </div>
      )}
    </div>
  );
}
