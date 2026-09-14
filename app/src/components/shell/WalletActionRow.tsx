import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import {
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  CreditCardIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
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
const WALLET_ACTIONS = [
  { id: 'buy', label: 'Buy', icon: PlusIcon },
  { id: 'send', label: 'Send', icon: PaperAirplaneIcon },
  { id: 'receive', label: 'Receive', icon: ArrowDownTrayIcon },
  { id: 'stake', label: 'Stake', icon: LockClosedIcon },
  { id: 'swap', label: 'Swap', icon: ArrowsRightLeftIcon },
] as const;

// Money screen's own three actions (2026-09-14, direct feedback: wireframe
// shows Add/Transfer/Card, not the wallet row's five) — a distinct action
// set, not a subset toggle of WALLET_ACTIONS: "Card" has no wallet-row
// equivalent, and "Add"/"Transfer" are fiat-account concepts (top up,
// move between accounts) rather than Buy/Send's crypto-market framing.
const MONEY_ACTIONS = [
  { id: 'add', label: 'Add', icon: PlusIcon },
  { id: 'transfer', label: 'Transfer', icon: ArrowsRightLeftIcon },
  { id: 'card', label: 'Card', icon: CreditCardIcon },
] as const;

export interface WalletActionRowProps { variant?: 'wallet' | 'money' }

export function WalletActionRow({ variant = 'wallet' }: WalletActionRowProps) {
  const actions = variant === 'money' ? MONEY_ACTIONS : WALLET_ACTIONS;
  return (
    <div className={styles.row} data-variant={variant}>
      {actions.map(({ id, label, icon }) => (
        <Button key={id} label={label} variant="secondary" className={styles.action}>
          <span className={styles.actionContent}>
            <Icon icon={icon} size="md" />
            <Text type="supporting" color="inherit">
              {label}
            </Text>
          </span>
        </Button>
      ))}
    </div>
  );
}
