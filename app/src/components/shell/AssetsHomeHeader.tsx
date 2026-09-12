import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import {
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { TrendDelta } from '../nodes/TrendDelta';
import glowStyles from '../../theme/glow.module.css';
import styles from './AssetsHomeHeader.module.css';

// Five distinct actions (2026-09-12, this page's own call): the reference
// mockup's action row repeats "Stake" twice, its own copy error rather
// than a spec — Swap replaces the duplicate as a real, distinct wallet
// action a crypto app's home screen plausibly needs.
const ACTIONS = [
  { id: 'buy', label: 'Buy', icon: PlusIcon },
  { id: 'send', label: 'Send', icon: PaperAirplaneIcon },
  { id: 'receive', label: 'Receive', icon: ArrowDownTrayIcon },
  { id: 'stake', label: 'Stake', icon: LockClosedIcon },
  { id: 'swap', label: 'Swap', icon: ArrowsRightLeftIcon },
] as const;

interface AssetsHomeHeaderProps {
  totalValue: number;
  changeAbs: number;
  changePercent: number;
}

// Balance glow (2026-09-12): reuses theme/glow.module.css's existing
// .topLeft + .topRight primitive combination rather than a new glow shape.
// Colour tracks the portfolio's own direction — --delta-up when the
// balance is up, --delta-down when it's down — so the screen's ambient
// light says which way the day went before any number is read. These are
// the same two tokens TrendDelta already uses, defined in all five
// registered themes, so no theme falls back silently.
//
// No longer renders the avatar/search row (2026-09-13, direct feedback:
// "header is avatar and search... scrollable is everything in the middle
// including all mainnets, portfolio value, and buttons"). That row now
// lives in MobileFrame's own shared <header> — fixed above every tab,
// avatar+search only, same element every other tab already used. This
// component is the part that scrolls: glow + balance + action row.
export function AssetsHomeHeader({ totalValue, changeAbs, changePercent }: AssetsHomeHeaderProps) {
  const isUp = changeAbs >= 0;
  return (
    <div
      className={`${styles.root} ${glowStyles.root} ${glowStyles.topLeft} ${glowStyles.topRight} ${glowStyles.clipped}`}
      style={{
        '--glow-color': isUp ? 'var(--delta-up)' : 'var(--delta-down)',
        '--glow-strength': 'var(--tint-subtle)',
      } as React.CSSProperties}
    >
      <div className={glowStyles.content}>
        <div className={styles.portfolio}>
          <Text type="label" color="secondary">
            All mainnets
          </Text>
          <Heading level={1} type="display-1" className={styles.balance}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Heading>
          <div className={styles.changeRow}>
            <Text type="supporting" hasTabularNumbers className={isUp ? styles.deltaUp : styles.deltaDown}>
              {isUp ? '+' : ''}
              {changeAbs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <TrendDelta value={changePercent} />
          </div>
        </div>
        <div className={styles.actionRow}>
          {ACTIONS.map(({ id, label, icon }) => (
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
      </div>
    </div>
  );
}
