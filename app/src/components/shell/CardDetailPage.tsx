import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { Heading } from '@astryxdesign/core/Heading';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { PlusIcon } from '@heroicons/react/24/outline';
import { VirtualCardPlaceholder } from './VirtualCardPlaceholder';
import { WalletActionRow } from './WalletActionRow';
import { ActivityGroups } from './ActivityGroups';
import { LinkChips } from '../nodes/LinkChips';
import { MONEY_HISTORY } from './moneyHistoryData';
import { MONEY_PLACEHOLDER } from './moneySummary';
import { WALLET_CARDS, type WalletCard } from './cardData';
import heroBalanceStyles from '../../theme/heroBalance.module.css';
import styles from './CardDetailPage.module.css';

export interface CardDetailPageProps {
  card: WalletCard;
  // Real on-screen rect of the deck's front card at the moment it was
  // tapped (CardDeck's own onCardOpen) — the FROM position for the
  // shared-element transform below. Undefined only if a caller somehow
  // opens this page without going through the deck tap (not currently
  // possible, kept optional rather than widening MobileFrame.tsx's own
  // non-null assertion into a real runtime branch nothing exercises).
  sourceRect: DOMRect;
  onClose: () => void;
}

type DetailTab = 'transactions' | 'benefits';

// Same pill-chip treatment as Discover's own category row (2026-09-16
// follow-up, direct feedback: "Transactions Benefits should be pill
// style tabs same as on discover All Crypto") — LinkChips itself (the
// exact component/markup Discover's row is), with a local
// "#card/tab/..." href namespace and a local delegated click handler,
// same two-line data-explore-link pattern Investments' own category
// chips already use for the identical "real component, local state, no
// navigation" need.
const DETAIL_TABS = [
  { id: 'transactions', label: 'Transactions', href: '#card/tab/transactions' },
  { id: 'benefits', label: 'Benefits', href: '#card/tab/benefits' },
] as const;

// Card Details screen (2026-09-16, direct feedback against a reference
// screenshot: "let's build card details page, needs to be seamless
// transition/animation, card in money view moves up and scale during
// page transition"). Full-screen overlay lifted to MobileFrame.tsx
// (useMobileFrame's own selectedCard state), not a Dialog — Astryx's
// Dialog bakes its own scale/translate enter keyframes onto the WHOLE
// dialog surface (confirmed via its own source), which would fight a
// custom per-element transform on the card art specifically. This is a
// plain absolutely-positioned overlay, same technique MobileFrame's own
// .page/.content layers already use, giving full control over animating
// ONLY the card while the rest of the page fades/slides in normally.
//
// Shared-element transform is hand-rolled FLIP (no animation library in
// this stack, same discipline CardDeck's own throw physics and
// AssetTrendGlyph's reveal animation already follow): on mount, measure
// the card art's own real resting rect, compute the delta against
// sourceRect (the deck's real on-screen position at tap time), apply
// that delta as an un-transitioned inverse transform so the card starts
// exactly where the deck's card was, then clear it one frame later WITH
// a transition — the browser animates the card from the deck's position
// into its resting spot. Reversed symmetrically on close.
export function CardDetailPage({ card, sourceRect, onClose }: CardDetailPageProps) {
  const [tab, setTab] = useState<DetailTab>('transactions');
  const [isClosing, setIsClosing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardIndex = WALLET_CARDS.findIndex((candidate) => candidate.id === card.id);

  function onTabClick(event: MouseEvent<HTMLElement>) {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('[data-explore-link]');
    const href = link?.getAttribute('data-explore-link');
    if (!href?.startsWith('#card/tab/')) return;
    event.preventDefault();
    const id = href.split('/')[2];
    if (id === 'transactions' || id === 'benefits') setTab(id);
  }

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const restRect = el.getBoundingClientRect();
    const scaleX = sourceRect.width / restRect.width;
    const scaleY = sourceRect.height / restRect.height;
    const translateX = sourceRect.left + sourceRect.width / 2 - (restRect.left + restRect.width / 2);
    const translateY = sourceRect.top + sourceRect.height / 2 - (restRect.top + restRect.height / 2);
    el.style.transition = 'none';
    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
    // Force layout before clearing the transform, so the browser paints
    // the inverted (deck) position at least once before the transition
    // below has anything to animate FROM — without this the two style
    // writes coalesce into one and the card just appears at rest, no
    // visible motion at all.
    el.getBoundingClientRect();
    el.style.transition = `transform var(--shell-mode-duration) var(--ease-float)`;
    el.style.transform = 'translate(0, 0) scale(1, 1)';
    // Runs once per mount only (a fresh CardDetailPage instance per open,
    // per MobileFrame.tsx's own key-less conditional render) — sourceRect
    // is only ever meaningful at the moment this page first appears.
  }, []);

  function close() {
    const el = cardRef.current;
    if (!el) { onClose(); return; }
    const restRect = el.getBoundingClientRect();
    const scaleX = sourceRect.width / restRect.width;
    const scaleY = sourceRect.height / restRect.height;
    const translateX = sourceRect.left + sourceRect.width / 2 - (restRect.left + restRect.width / 2);
    const translateY = sourceRect.top + sourceRect.height / 2 - (restRect.top + restRect.height / 2);
    setIsClosing(true);
    el.style.transition = `transform var(--shell-mode-duration) var(--ease-float)`;
    el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
    window.setTimeout(onClose, 480);
  }

  return (
    <div className={styles.root} data-closing={isClosing} role="dialog" aria-label={`${card.name} details`}>
      <header className={styles.header}>
        <IconButton label="Back" icon={<Icon icon="chevronLeft" />} variant="ghost" onClick={close} />
        <IconButton label="Add card" icon={<Icon icon={PlusIcon} />} variant="ghost" />
      </header>
      <div className={styles.body}>
        <div ref={cardRef} className={styles.cardStage}>
          <VirtualCardPlaceholder lastFourDigits={card.lastFourDigits} {...(card.image ? { image: card.image } : {})} />
        </div>
        {WALLET_CARDS.length > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Cards">
            {WALLET_CARDS.map((candidate, index) => (
              <span key={candidate.id} className={styles.dot} data-active={index === cardIndex} role="tab"
                aria-selected={index === cardIndex} aria-label={candidate.name} />
            ))}
          </div>
        )}

        {/* Show details/Freeze/Manage card, moved here from a small
            ghost-icon row (2026-09-16 follow-up, direct feedback: "hide
            Pause settings remove and change them... move them under
            card") — same circular-icon-with-label styling as every
            other WalletActionRow variant, not icon-only pills. Manage
            card moved up from Money's own action row below (which drops
            to three actions) rather than appearing in both places. */}
        <WalletActionRow variant="card" shape="circle" />

        <div className={styles.balanceBlock}>
          <Heading level={1} type="display-1" className={heroBalanceStyles.heroBalance}>
            ${MONEY_PLACEHOLDER.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Heading>
          <div className={styles.apyRow}>
            <Text type="supporting" weight="semibold" className={styles.apy}>{MONEY_PLACEHOLDER.apy}% APY</Text>
            <Text type="supporting" color="secondary">· mUSD</Text>
            <Icon icon="info" size="sm" color="secondary" />
            <Text type="supporting" color="secondary">· Est. annual</Text>
            <Text type="supporting" weight="semibold" hasTabularNumbers className={styles.apy}>
              ${MONEY_PLACEHOLDER.annualEarnings.toFixed(2)}
            </Text>
          </div>
        </div>

        <WalletActionRow variant="money" shape="circle" />

        <div onClick={onTabClick}>
          <LinkChips label="Card detail tabs" variant="chips" active={tab} links={[...DETAIL_TABS]} />
        </div>

        {tab === 'transactions' ? (
          <ActivityGroups entries={MONEY_HISTORY} />
        ) : (
          // No real card-benefits content exists in the universe seed
          // (cashbackPercent is the only authored benefit, already shown
          // on WalletCardTile elsewhere) — an honest empty state rather
          // than fabricating perks copy, same posture MoneyPage's own
          // Earn/NFTs sections held before they had real data.
          <EmptyState title="No benefits yet" description="Card benefits will appear here once available." />
        )}
      </div>
    </div>
  );
}
