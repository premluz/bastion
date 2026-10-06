import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowsRightLeftIcon,
  CreditCardIcon,
  EyeIcon,
  LockClosedIcon,
  PauseCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { PROTOTYPE_NOTICE, notifyPrototypeUnavailable } from './PrototypeNotice';
import styles from './WalletActionRow.module.css';

// Extracted out of AssetsHomeHeader.tsx (2026-09-13, direct feedback:
// "remove from homepage buttons buy spend receive (keep as comp)") — the
// row itself is unchanged, just no longer rendered on Home. Kept as its
// own component so it stays available (Storybook-previewable, reusable)
// for whichever screen picks it up next, rather than deleted.
//
// Five distinct actions (2026-09-12, this page's own call): the reference
// mockup's action row repeats "Stake" twice, its own copy error rather
// than a spec — Swap replaces the duplicate as a real, distinct wallet
// action a crypto app's home screen plausibly needs.
// Trimmed to Buy / Stake / Swap (2026-10-06, direct feedback: "on portfolio
// only Buy, Stake, Swap") — Send/Receive live on Money's own row.
const WALLET_ACTIONS = [
  { id: 'buy', label: 'Buy', icon: PlusIcon },
  { id: 'stake', label: 'Stake', icon: LockClosedIcon },
  { id: 'swap', label: 'Swap', icon: ArrowsRightLeftIcon },
] as const;

// Money screen's own four actions (2026-09-15, direct feedback against a
// wireframe: "Add money / Send / Withdraw / Manage card" — supersedes the
// prior day's three-action Add/Transfer/Card guess, built before this
// wireframe existed). A distinct action set, not a subset toggle of
// WALLET_ACTIONS: "Manage card" has no wallet-row equivalent, and these
// are fiat-account concepts (top up, move between accounts, card
// management) rather than Buy/Send's crypto-market framing.
const MONEY_ACTIONS = [
  { id: 'add', label: 'Add money', icon: PlusIcon },
  { id: 'send', label: 'Send', icon: ArrowUpTrayIcon },
  { id: 'withdraw', label: 'Withdraw', icon: ArrowDownTrayIcon },
] as const;

// Card Details' own row, directly under the card art (2026-09-16, direct
// feedback: hide the small ghost Pause/Settings icons that used to sit
// there, and move "Manage card" up out of Money's own action row to join
// them here instead — Money's own row drops to three actions
// (Add money/Send/Withdraw) since Manage card now lives only here, not
// in both places). Same circular-icon-with-label styling as every other
// WalletActionRow variant, not the small ghost pills this replaces.
const CARD_ACTIONS = [
  { id: 'show-details', label: 'Show details', icon: EyeIcon },
  // PauseCircleIcon stands in for "Freeze" — no snowflake glyph exists in
  // the closed Heroicons set this project is pinned to (confirmed when
  // the icon-only row was first built).
  { id: 'freeze', label: 'Freeze', icon: PauseCircleIcon },
  { id: 'manage-card', label: 'Manage card', icon: CreditCardIcon },
] as const;

export interface WalletActionRowProps {
  variant?: 'wallet' | 'money' | 'card';
  // Two complete, independently choosable shapes (2026-09-16, direct
  // feedback: "2 variants that can be configured per instance, not each
  // instance has different like now") — roundedSquare and circle are the
  // same size/fill/hover, differing only in border-radius; neither is a
  // fallback for the other.
  shape?: 'roundedSquare' | 'circle';
  // Compact size (2026-09-16, direct feedback for Investments: "five
  // large actions plus allocation push the actual assets too far down.
  // Use compact actions") — a smaller icon/label footprint for a context
  // where actions are a secondary row, not the page's own focal point
  // the way Money's/Home's full-size row is. Default unchanged.
  size?: 'default' | 'compact';
}

export function WalletActionRow({ variant = 'wallet', shape = 'roundedSquare', size = 'default' }: WalletActionRowProps) {
  const actions = variant === 'money' ? MONEY_ACTIONS : variant === 'card' ? CARD_ACTIONS : WALLET_ACTIONS;
  return (
    <div className={styles.row} data-variant={variant} data-size={size}>
      {actions.map(({ id, label, icon }) => (
        // A native <label> around the button makes the whole tile — circle
        // and caption — one rectangular hit area (2026-09-30, direct
        // feedback) with no visible panel: a click anywhere in it activates
        // the button through the label's own activation behaviour.
        <label key={id} className={styles.action}>
          {/* IconButton itself is the whole clickable/hoverable surface
              (2026-09-15, direct feedback against a reference screenshot:
              "rounded action row has not got additional square rounded
              pane around it, it's just rounded... hover is on that
              rounded pill, label is outside") — the label used to live
              inside a Button variant="secondary", which gave the entire
              tile (icon + label) its own panel and hover. ghost strips
              that panel; the shape/fill/color this component already
              applied to the icon now lives directly on the real button. */}
          <IconButton label={label} tooltip={PROTOTYPE_NOTICE} onClick={notifyPrototypeUnavailable}
            icon={<Icon icon={icon} size={size === 'compact' ? 'sm' : 'md'} />} variant="ghost"
            className={styles.iconShape} data-shape={shape} data-size={size} />
          <Text type="supporting" color="secondary" className={styles.caption}>
            {label}
          </Text>
        </label>
      ))}
    </div>
  );
}
