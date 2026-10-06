import { EmptyState } from '@astryxdesign/core/EmptyState';
import { resolveAssetsHomeSummary } from '../../engine/assetsHome';
import { AssetsHomeHeader } from './AssetsHomeHeader';
import { AssetsHomeList } from './AssetsHomeList';
import { ContentGroup } from '../nodes/ContentGroup';
import { PromoCardFull } from './PromoCardFull';
import { PromoCarousel } from './PromoCarousel';
import styles from './AssetsHomePage.module.css';

// Placeholder tiles (2026-09-13) — no real promo/offers content exists in
// this fork's universe seed; authored copy only, same "never fabricate
// DATA" line this page already draws for Earn/NFTs (fabricating promo
// COPY carries no such risk — there's no number here to get wrong — but
// the tiles themselves are still a stand-in for a real promotions feed,
// not real offers).
const PROMOS = [
  { id: 'offers', title: 'Explore offers and earn' },
  { id: 'idle-cash', title: 'Put your idle cash to work at 6.4%' },
  { id: 'lounge', title: 'Free premium lounge at airports', icon: '🎁' },
] as const;

// New page, not a HoldingsPage.tsx replacement or restyle (2026-09-12 call,
// stated per the phase brief): HoldingsPage renders a DataTable keyed off
// CONNECTED wallets (empty-state gated on walletConnectionStore — "connect
// a wallet to see holdings"), the Phase 15 "view owned assets" surface.
// This page is the Home TAB's own always-visible balance/asset-list
// treatment — same underlying wallet math (resolveAssetsHomeSummary reuses
// HoldingsPage's own resolveEntityDetail-based value computation, not a
// re-derived pipeline), but a different page with a different visibility
// rule and a different visual grammar (glow header, category cards, promo
// carousel). Duplicating the fetch would be the violation this file avoids;
// duplicating the PAGE would not — they answer different questions
// ("what do I own, once connected" vs. "what does my wallet look like on
// open").
//
// Crypto/Earn/NFTs segmented tabs removed (2026-09-13, direct feedback:
// "remove tabs crypto earn etc.") — the list always shows crypto holdings
// now, the only real data this page has; Earn/NFTs had no real data
// either and only ever rendered an empty state.
export interface AssetsHomePageProps { onSelectMoney?: () => void; onSelectInvestments?: () => void }

export function AssetsHomePage({ onSelectMoney, onSelectInvestments }: AssetsHomePageProps) {
  // Tracks which row is open — real state, not a stub, but with nowhere
  // to route yet (2026-09-13): Bastion's mobile shell has no ScreenStack
  // or asset-detail screen built (Phase 3/5, both still open per CLAUDE.md
  // §3/§10). Selecting a row is real interaction — Item needs a real
  // onClick to render as a button and pick up hover at all, an inert
  // onClick would be the exact "clickable but does nothing" bug this was
  // built to fix — but its destination is a placeholder honestly scoped
  // to this page until a real asset-detail screen exists to open instead.
  const summary = resolveAssetsHomeSummary();

  return (
    <div className={styles.root}>
      <div className={styles.body}>
        {/* Balance tiles and the promo share the tiles' own 12px card gap
            (2026-10-06, direct feedback: "these 3 panes should have the same
            spacing") — the page's larger section gap starts at Coins. */}
        <div className={styles.cardStack}>
          <AssetsHomeHeader totalValue={summary.totalValue} changeAbs={summary.changeAbs} changePercent={summary.changePercent}
            {...(onSelectMoney ? { onSelectMoney } : {})} {...(onSelectInvestments ? { onSelectInvestments } : {})} />
          <PromoCarousel aria-label="Promotions">
            {PROMOS.map((promo) => (
              <PromoCardFull key={promo.id} title={promo.title} {...('icon' in promo ? { icon: promo.icon } : {})} />
            ))}
          </PromoCarousel>
        </div>
        {/* Same heading treatment as Discover's own sections (2026-09-16
            follow-up, direct feedback: "Coins header on homepage should
            be with link and chevron as Perps etc on Discover") —
            ContentGroup itself, with a placeholder href: Home has no
            delegated data-explore-link listener (that's Explore/Markets'
            own .page onClick), so this is inert, same honest posture as
            Discover's own #explore/group/perp-cards href, which also
            leads nowhere yet. Manage/filter button stays removed
            (2026-09-16 ruling, unchanged). */}
        <ContentGroup title="Coins" href="#home/coins" layout="stack">
          {summary.rows.length > 0 ? (
            <AssetsHomeList rows={summary.rows} />
          ) : (
            <EmptyState title="No assets yet" description="Connect a wallet to see your crypto holdings here." />
          )}
        </ContentGroup>
      </div>
    </div>
  );
}
