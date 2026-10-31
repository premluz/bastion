import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import type { AttentionItem } from '../../engine/attentionQueue';
import { AttentionCardBody } from './AttentionCardBody';
import glowStyles from '../../theme/glow.module.css';
import { MagicBorder } from './MagicBorder';
import styles from './AttentionCard.module.css';

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
      <ClickableCard className={`${styles.root} ${glowStyles.root} ${glowStyles.bottom} ${glowStyles.clipped}`} padding={6} onClick={() => onOpen(item.id)} data-attention-kind={item.kind} data-attention-item={item.id}
        label={`${item.title}, ${position} of ${count}${isProcessing ? ', in progress' : ''}`}>
        <AttentionCardBody kind={item.kind} title={item.title} action={item.action} />
      </ClickableCard>
    </MagicBorder>
  );
}
