import walletsJson from '../../universe/wallets.json';
import { resolveEntityDetail } from './entityDetail';

interface UniverseWalletHolding {
  entityId: string;
  quantity: number;
  costBasis: number;
}

interface UniverseWalletRecord {
  id: string;
  name: string;
  type: string;
  holdings: UniverseWalletHolding[];
}

const wallets = Object.values(walletsJson as Record<string, UniverseWalletRecord>);

export interface AssetHomeRow {
  entityId: string;
  name: string;
  symbol: string;
  value: number;
  quantity: number;
  deltaPercent: number;
}

// Same math as HoldingsPage.tsx's buildHoldingsTable (quantity × current
// price via resolveEntityDetail) — reused rather than re-derived, per
// this page's own brief: a different VISUAL treatment of the same
// holdings data, not a parallel data pipeline. Symbol is read off the
// entity's own "Symbol" attribute (universe/entities.json), falling back
// to the entity id upper-cased if a future entity omits it.
function symbolFor(entityId: string, attributes: { label: string; value: string | number }[]): string {
  const symbolAttr = attributes.find((attribute) => attribute.label === 'Symbol');
  return symbolAttr ? String(symbolAttr.value) : entityId.toUpperCase();
}

export interface AssetsHomeSummary {
  totalValue: number;
  changeAbs: number;
  changePercent: number;
  rows: AssetHomeRow[];
}

// One wallet only (Phase 3 seed scope — see universe/wallets.json's own
// single mock-wallet-1 entry): this page previews a single "your assets"
// balance, not a multi-wallet aggregate like HoldingsPage's own connected-
// wallets list. Empty wallets/holdings resolve to an honest zero-row
// summary rather than a crash.
export function resolveAssetsHomeSummary(): AssetsHomeSummary {
  const wallet = wallets[0];
  if (!wallet) return { totalValue: 0, changeAbs: 0, changePercent: 0, rows: [] };

  let totalValue = 0;
  let previousTotalValue = 0;
  const rows: AssetHomeRow[] = wallet.holdings.map((holding) => {
    const entity = resolveEntityDetail(holding.entityId);
    const currentPrice = entity?.primaryLatest ?? holding.costBasis;
    const deltaRecent = entity?.deltaRecent ?? 0;
    const previousPrice = currentPrice - deltaRecent;
    const value = holding.quantity * currentPrice;
    totalValue += value;
    previousTotalValue += holding.quantity * previousPrice;
    return {
      entityId: holding.entityId,
      name: entity?.name ?? holding.entityId,
      symbol: entity ? symbolFor(holding.entityId, entity.attributes) : holding.entityId.toUpperCase(),
      value,
      quantity: holding.quantity,
      deltaPercent: previousPrice !== 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0,
    };
  });

  const changeAbs = totalValue - previousTotalValue;
  const changePercent = previousTotalValue !== 0 ? (changeAbs / previousTotalValue) * 100 : 0;
  return { totalValue, changeAbs, changePercent, rows };
}
