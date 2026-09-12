import { useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Icon } from '@astryxdesign/core/Icon';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { Text } from '@astryxdesign/core/Text';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { resolveAssetsHomeSummary } from '../../engine/assetsHome';
import { AssetsHomeHeader } from './AssetsHomeHeader';
import { AssetsHomeList } from './AssetsHomeList';
import styles from './AssetsHomePage.module.css';

type AssetsSegment = 'crypto' | 'earn' | 'nfts';

// New page, not a HoldingsPage.tsx replacement or restyle (2026-09-12 call,
// stated per the phase brief): HoldingsPage renders a DataTable keyed off
// CONNECTED wallets (empty-state gated on walletConnectionStore — "connect
// a wallet to see holdings"), the Phase 15 "view owned assets" surface.
// This page is the Home TAB's own always-visible balance/asset-list
// treatment — same underlying wallet math (resolveAssetsHomeSummary reuses
// HoldingsPage's own resolveEntityDetail-based value computation, not a
// re-derived pipeline), but a different page with a different visibility
// rule and a different visual grammar (glow header, action row, segmented
// control). Duplicating the fetch would be the violation this file avoids;
// duplicating the PAGE would not — they answer different questions
// ("what do I own, once connected" vs. "what does my wallet look like on
// open").
//
// Earn/NFTs segments (2026-09-12): no Earn or NFT holdings data exists in
// this fork's universe seed, so both render an honest empty state rather
// than fabricated rows — same "never fabricate" discipline assetDiscovery
// already documents for vantara-metals' own missing series.
export function AssetsHomePage() {
  const [segment, setSegment] = useState<AssetsSegment>('crypto');
  // Tracks which row is open — real state, not a stub, but with nowhere
  // to route yet (2026-09-13): Bastion's mobile shell has no ScreenStack
  // or asset-detail screen built (Phase 3/5, both still open per CLAUDE.md
  // §3/§10). Selecting a row is real interaction — Item needs a real
  // onClick to render as a button and pick up hover at all, an inert
  // onClick would be the exact "clickable but does nothing" bug this was
  // built to fix — but its destination is a placeholder honestly scoped
  // to this page until a real asset-detail screen exists to open instead.
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const summary = resolveAssetsHomeSummary();

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <AssetsHomeHeader totalValue={summary.totalValue} changeAbs={summary.changeAbs} changePercent={summary.changePercent} />
        <SegmentedControl value={segment} onChange={(value) => setSegment(value as AssetsSegment)} label="Asset category" layout="fill">
          <SegmentedControlItem value="crypto" label="Crypto" />
          <SegmentedControlItem value="earn" label="Earn" />
          <SegmentedControlItem value="nfts" label="NFTs" />
        </SegmentedControl>
        <div className={styles.listHeader}>
          <Text type="label">Your assets</Text>
          <Button label="Manage" variant="ghost" size="sm">
            <span className={styles.manageContent}>
              <Icon icon={FunnelIcon} size="sm" />
              <Text type="supporting" color="inherit">
                Manage
              </Text>
            </span>
          </Button>
        </div>
        {segment === 'crypto' ? (
          summary.rows.length > 0 ? (
            <AssetsHomeList rows={summary.rows} selectedAssetId={selectedAssetId} onSelectAsset={setSelectedAssetId} />
          ) : (
            <EmptyState title="No assets yet" description="Connect a wallet to see your crypto holdings here." />
          )
        ) : (
          <EmptyState
            title={segment === 'earn' ? 'No earn positions yet' : 'No NFTs yet'}
            description="This preview's universe data doesn't have any yet — nothing fabricated here."
          />
        )}
      </div>
    </div>
  );
}
