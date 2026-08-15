import { useMemo, useState } from 'react';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { List, ListItem } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';
import walletsJson from '../../../universe/wallets.json';
import { resolveEntityDetail } from '../../engine/entityDetail';
import { resolveClickedEntityId } from '../../engine/entityLinkClick';
import { useWalletConnectionStore } from '../../engine/stores/walletConnectionStore';
import { usePageStore } from '../../engine/stores/pageStore';
import { PageShell } from './PageShell';
import { PageSection } from './PageSection';
import { DataTable } from '../nodes/DataTable';
import { MetricGrid } from '../nodes/MetricGrid';
import { Metric } from '../nodes/Metric';
import { ConnectWalletDialog, type WalletEntry } from './ConnectWalletDialog';
import type { TableDataSet } from '../../contracts/data';

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

function buildHoldingsTable(wallet: UniverseWalletRecord): { data: TableDataSet; totalValue: number } {
  let totalValue = 0;
  const rows = wallet.holdings.map((holding) => {
    const entity = resolveEntityDetail(holding.entityId);
    const currentPrice = entity?.primaryLatest ?? holding.costBasis;
    const value = holding.quantity * currentPrice;
    totalValue += value;
    return {
      asset: entity ? { entityId: holding.entityId, label: entity.name } : holding.entityId,
      quantity: holding.quantity,
      price: `$${currentPrice.toFixed(2)}`,
      value: `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      trend: entity?.primary?.points.slice(-30) ?? [],
    };
  });

  return {
    data: {
      kind: 'table',
      columns: [
        { key: 'asset', label: 'Asset', type: 'entity' },
        { key: 'quantity', label: 'Quantity', type: 'number' },
        { key: 'price', label: 'Price', type: 'string' },
        { key: 'value', label: 'Value', type: 'string' },
        { key: 'trend', label: 'Trend', type: 'sparkline' },
      ],
      rows,
    },
    totalValue,
  };
}

// Page (Phase 15 WO-2). Empty until at least one wallet is connected —
// connecting is the only way holdings appear (WO-1's ConnectWalletDialog
// + walletConnectionStore), same "session state gates content" discipline
// as WatchlistPage's own empty state. Static page, no SceneRenderer, no
// trail, no submitQuery — every prop below is authored/computed directly
// from universe/wallets.json + resolveEntityDetail's already-authored
// prices, same reuse posture as PortfolioDashboardPage. No Buy/Sell/
// Trade/Send/Receive CTA anywhere — this is a holdings VIEW, not a wallet
// app (node-vocabulary.md's own Holdings entry).
export function HoldingsPage() {
  const connectedWalletIds = useWalletConnectionStore((state) => state.connectedWalletIds);
  const connect = useWalletConnectionStore((state) => state.connect);
  const [selectedWallet, setSelectedWallet] = useState<WalletEntry | null>(null);
  const openEntityDetail = usePageStore((state) => state.openEntityDetail);

  const connectedWallets = useMemo(() => wallets.filter((wallet) => connectedWalletIds[wallet.id]), [connectedWalletIds]);
  const availableWallets = useMemo(() => wallets.filter((wallet) => !connectedWalletIds[wallet.id]), [connectedWalletIds]);

  const walletTables = useMemo(
    () => connectedWallets.map((wallet) => ({ wallet, ...buildHoldingsTable(wallet) })),
    [connectedWallets],
  );

  const aggregateValue = walletTables.reduce((sum, { totalValue }) => sum + totalValue, 0);

  return (
    <PageShell title="Holdings">
      {connectedWallets.length === 0 ? (
        <EmptyState
          title="No wallets connected yet"
          description="Connect a wallet below to see its holdings here — session-scoped, nothing persists after a reset."
        />
      ) : (
        <PageSection title="Overview">
          <MetricGrid>
            <Metric label="Total value" value={`$${aggregateValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <Metric label="Connected wallets" value={connectedWallets.length} />
          </MetricGrid>
        </PageSection>
      )}

      {walletTables.map(({ wallet, data }) => (
        <PageSection key={wallet.id} title={wallet.name} source={wallet.type}>
          <div
            onClick={(event) => {
              const entityId = resolveClickedEntityId(event);
              if (entityId) openEntityDetail(entityId);
            }}
          >
            <DataTable data={data} />
          </div>
        </PageSection>
      ))}

      {availableWallets.length > 0 && (
        <PageSection title="Connect a wallet">
          <Text type="supporting" color="secondary">
            Preview only — a design surface for a multi-wallet connect flow, wired to nothing real;
            nothing connected here reaches a live wallet, and nothing persists after a session reset.
          </Text>
          <List hasDividers density="compact">
            {availableWallets.map((wallet) => (
              <ListItem
                key={wallet.id}
                label={wallet.name}
                description={wallet.type}
                endContent={
                  <Text type="supporting" color="secondary">
                    Connect
                  </Text>
                }
                onClick={() => setSelectedWallet(wallet)}
              />
            ))}
          </List>
        </PageSection>
      )}

      <ConnectWalletDialog wallet={selectedWallet} onOpenChange={(isOpen) => !isOpen && setSelectedWallet(null)} onConfirm={connect} />
    </PageShell>
  );
}
