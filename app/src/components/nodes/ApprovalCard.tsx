import { useRef } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Avatar } from '@astryxdesign/core/Avatar';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { useStreamingText } from '@astryxdesign/core/hooks';
import type { ApprovalCardProps } from '../../contracts/props/approval-card';
import { ApprovalNavigation } from './ApprovalNavigation';
import '../../theme/approval.css';
import styles from './ApprovalCard.module.css';

export function ApprovalCard(props: ApprovalCardProps) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const title = useStreamingText(props.prompt, !reduced);
  const multiple = props.questionCount > 1;
  return <div ref={root} data-approval-card={props.questionId}>
    {/* Delegated click on the whole row (2026-09-13, direct feedback: "hit
        area is a smaller layer inside pane... entire pane should be the
        hit area"). RadioListItem's own <label htmlFor> only covers the
        label text itself (measured live: ~38px of a 398px row) —
        approval.css's own background/padding is applied to
        .astryx-radio-list-item, so the visible pane and the clickable
        area never matched to begin with (confirmed by clicking empty row
        space before assuming a fix was needed: the radio stayed
        unchecked). Attached here on Card, not on RadioList itself: tried
        passing onClick to RadioList first, but its own destructured
        params list every prop it forwards explicitly with no rest/spread
        — a prop TypeScript accepts (BaseProps includes onClick) can still
        be silently dropped at runtime if the component's own destructure
        never reads it, confirmed by reading RadioList.tsx's full
        parameter list rather than assuming type-correct meant
        wired-through. Native click bubbling still reaches this handler
        from inside RadioList's own DOM regardless of where React's tree
        attaches it, so Card is a safe place to catch it. Forwards to the
        row's real <input>, firing the same native change event the
        existing RadioList onChange below already handles — no new
        selection logic, just a bigger way to reach it. */}
    <Card padding={0} className={`${styles.card}`} onClick={(event) => {
      const target = event.target as HTMLElement;
      if (target.closest('input, label')) return;
      target.closest('.astryx-radio-list-item')?.querySelector<HTMLInputElement>('input[type="radio"]')?.click();
    }}>
      <header className={styles.header}><Text className={styles.prompt}>{title}</Text>
        {props.isDismissible && <IconButton label="Dismiss question" icon={<Icon icon="close" />} variant="ghost" data-approval-action="dismiss" />}
      </header>
      <RadioList label={props.prompt} isLabelHidden value={props.selected ?? ''} isDisabled={props.isDisabled}
        onChange={(value) => root.current?.setAttribute('data-approval-value', value)}>
        {props.options.map((option) => <RadioListItem key={option.value} value={option.value} label={option.label}
          {...(option.avatar ? { startContent: <Avatar name={option.label} size="small" /> } : {})}
          {...(option.description ? { description: option.description } : {})} isDisabled={option.isDisabled} />)}
      </RadioList>
      {multiple && props.allowOther && <div data-approval-other="true"><TextInput label="Something else" isLabelHidden
        placeholder="Something else…" value={props.otherValue} isDisabled={props.isDisabled}
        onChange={(value) => root.current?.setAttribute('data-approval-other-value', value)} /></div>}
      {multiple && props.navigationMode !== 'hidden' && <ApprovalNavigation {...props} />}
    </Card>
  </div>;
}
