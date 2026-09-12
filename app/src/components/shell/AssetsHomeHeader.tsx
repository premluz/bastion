import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
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

// Balance glow (2026-09-12, visual-identity choice pending CLAUDE.md §10):
// reuses theme/glow.module.css's existing .topLeft + .topRight primitive
// combination rather than a new glow shape, colored via --accent-signal —
// the app has no dedicated "wallet home" accent decided yet, so this
// deliberately reads as a neutral placeholder, not a real brand color
// call. Flagged in the phase report, not decided silently here.
export function AssetsHomeHeader({ totalValue, changeAbs, changePercent }: AssetsHomeHeaderProps) {
  return (
    <div
      className={`${styles.root} ${glowStyles.root} ${glowStyles.topLeft} ${glowStyles.topRight} ${glowStyles.clipped}`}
      style={{ '--glow-color': 'var(--accent-signal)', '--glow-strength': 'var(--tint-subtle)' } as React.CSSProperties}
    >
      <div className={glowStyles.content}>
        <div className={styles.identityRow}>
          <Avatar name="Wallet" size="small" />
          <TextInput label="Search assets" isLabelHidden startIcon="search" value="" placeholder="Search assets" isDisabled />
        </div>
        <Text type="label" color="secondary">
          All mainnets
        </Text>
        <Heading level={1} type="display-1" className={styles.balance}>
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Heading>
        <div className={styles.changeRow}>
          <Text type="supporting" hasTabularNumbers className={changeAbs >= 0 ? styles.deltaUp : styles.deltaDown}>
            {changeAbs >= 0 ? '+' : ''}
            {changeAbs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <TrendDelta value={changePercent} />
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
