import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { ArrowTrendingUpIcon, ExclamationCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import type { AttentionItem, AttentionKind } from '../../engine/attentionQueue';
import glowStyles from '../../theme/glow.module.css';
import { MagicBorder } from './MagicBorder';
import styles from './AttentionCard.module.css';

const KIND_ICON: Record<AttentionKind, typeof UserIcon> = { due: ExclamationCircleIcon, request: UserIcon, review: ArrowTrendingUpIcon };

export interface AttentionCardProps {
  item: AttentionItem;
  /** Where it sits in the queue, for assistive tech only (2026-10-23: the card shows icon and title alone). */
  position: number;
  count: number;
  /** Handed to the assistant and not done yet: the card stays, wrapped in the magic border (the queue will not reopen it). */
  isProcessing: boolean;
  onOpen: (id: string) => void;
}

// One item in the attention queue (2026-10-23, direct feedback): its kind's icon on the left
// and its title, in the Pulse rows' size — nothing else; the context lives in the full view
// the whole card opens. While the assistant works on it (2026-10-27), the magic border runs
// around it; the card itself, icon included, is unchanged.
export function AttentionCard({ item, position, count, isProcessing, onOpen }: AttentionCardProps) {
  return (
    <MagicBorder isActive={isProcessing} variant="bottom" className={styles.frame}>
      <ClickableCard className={`${styles.root} ${glowStyles.root} ${glowStyles.bottom} ${glowStyles.clipped}`} padding={6} onClick={() => onOpen(item.id)} data-attention-kind={item.kind}
        label={`${item.title}, ${position} of ${count}${isProcessing ? ', in progress' : ''}`}>
        <span className={styles.mark}><Icon icon={KIND_ICON[item.kind]} size="sm" /></span>
        <Text type="body" className={styles.title}>{item.title}</Text>
      </ClickableCard>
    </MagicBorder>
  );
}
