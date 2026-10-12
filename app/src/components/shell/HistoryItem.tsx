import { Item } from '@astryxdesign/core/Item';
import { Icon } from '@astryxdesign/core/Icon';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import {
  ArrowsRightLeftIcon, Squares2X2Icon, PaperAirplaneIcon, ShoppingCartIcon, FilmIcon,
} from '@heroicons/react/24/outline';
import type { HistoryCategory, HistoryEntry } from '../../contracts/props/history-item';
import { CoinLogo } from './CoinLogo';
import { formatHistoryAmount } from './accountHistory';
import { PrototypeHint } from './PrototypeNotice';
import { avatarProps } from '../../avatars';
import styles from './HistoryItem.module.css';

export interface HistoryItemProps { entry: HistoryEntry; onSelect?: (entry: HistoryEntry) => void }

// Category → icon (2026-09-14) — the contract holds a closed enum, not a
// JSX reference (rule 6); this is the one place that maps it to a real
// heroicon, same separation entry.kind's own trade/interaction fallback
// below already uses. 'shopping' shares ShoppingCartIcon with 'groceries':
// no distinct shopping-bag glyph was worth a second visual in this set.
const CATEGORY_ICONS: Record<HistoryCategory, typeof ArrowsRightLeftIcon> = {
  travel: PaperAirplaneIcon, groceries: ShoppingCartIcon, shopping: ShoppingCartIcon,
  entertainment: FilmIcon, transfer: ArrowsRightLeftIcon, other: Squares2X2Icon,
};

// Astryx's avatar scale has no 44px step (--list-accessory-size): the next step up,
// fitted into the accessory circle by HistoryItem.module.css.
const ACCESSORY_SIZE = 48;

// Shell row with validated data props; no registry action or engine dependency.
export function HistoryItem({ entry, onSelect }: HistoryItemProps) {
  const amount = entry.displayAmount ?? formatHistoryAmount(entry);
  // Icons (not photos, initials or coin logos) sit on the shared accessory fill.
  const isIcon = entry.avatar?.kind === 'category' || (entry.avatar?.kind !== 'initials' && !entry.assetId);
  const item = (
    <Item className={styles.root} density="spacious" data-testid={`history-${entry.id}`}
      label={entry.title} description={entry.detail}
      {...(onSelect ? { onClick: () => onSelect(entry) } : {})}
      startContent={<span className={styles.asset} data-icon={isIcon ? '' : undefined}>
        {entry.avatar?.kind === 'initials' ? <Avatar {...avatarProps(entry.avatar.name)} size={ACCESSORY_SIZE} />
          : entry.avatar?.kind === 'category' ? <Icon icon={CATEGORY_ICONS[entry.avatar.category]} size="lg" />
          : entry.assetId ? <CoinLogo entityId={entry.assetId} label={entry.symbol ?? ''} />
          : <Icon icon={entry.kind === 'trade' ? ArrowsRightLeftIcon : Squares2X2Icon} size="lg" />}
      </span>}
      endContent={<span className={styles.value}>
        {amount && <Text type="body" hasTabularNumbers className={entry.direction === 'in' ? styles.incoming : styles.amount}>{amount}</Text>}
        {entry.status !== 'confirmed' && <Badge variant={entry.status === 'failed' ? 'error' : 'neutral'}
          label={entry.status === 'failed' ? 'Failed' : 'Pending'} />}
      </span>} />
  );
  return onSelect ? item : <PrototypeHint>{item}</PrototypeHint>;
}
