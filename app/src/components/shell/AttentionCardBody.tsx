import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import type { AttentionKind } from '../../engine/attentionQueue';
import { ATTENTION_ICON } from './attentionIcons';
import styles from './AttentionCard.module.css';

/** An attention card's contents: its kind's mark, its title, and the one thing to do on a second line, if it has one. The
 *  home's card and the opening of the conversation it starts (ScenarioOpening) draw the same, so the card can travel. */
export function AttentionCardBody({ kind, title, action }: { kind: AttentionKind; title: string; action?: string | undefined }) {
  return <>
    <span className={styles.mark}><Icon icon={ATTENTION_ICON[kind]} size="sm" /></span>
    <span className={styles.text}>
      <Text type="body" className={styles.title}>{title}</Text>
      {action && <Text type="supporting" color="secondary" className={styles.action}>{action}</Text>}
    </span>
  </>;
}
