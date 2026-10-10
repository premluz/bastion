import { useRef } from 'react';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { PaymentCardProps } from '../../contracts/props/payment-card';
import '../../theme/approval.css';
import heroBalanceStyles from '../../theme/heroBalance.module.css';
import '../../theme/sending.css';
import styles from './PaymentCard.module.css';

const SENDER_NAME = 'Preview user';

// Fills the 64px route disc (--send-avatar-size) so no band of the disc
// shows around it as a darker ring (2026-10-06, direct feedback).
const AVATAR_SIZE = 64;

function TransferRoute({ recipient, isSuccess, isPending, inline }: {
  recipient: string; isSuccess: boolean; isPending: boolean; inline: boolean;
}) {
  return <div className={styles.route} data-success={isSuccess ? '' : undefined}
    data-pending={isPending ? '' : undefined} data-inline={inline ? '' : undefined} aria-hidden="true">
    {isPending && <>
      <span className={styles.ripple} />
      <span className={styles.ripple} />
      <span className={styles.ripple} />
    </>}
    {(!isSuccess || inline) && <>
      <span className={styles.party} data-side="from"><Avatar name={SENDER_NAME} size={AVATAR_SIZE} /></span>
      <span className={styles.chevrons}>
        <ChevronRightIcon className={styles.chevron} />
        <ChevronRightIcon className={styles.chevron} />
        <ChevronRightIcon className={styles.chevron} />
      </span>
      <span className={styles.party} data-side="to"><Avatar name={recipient} size={AVATAR_SIZE} /></span>
    </>}
    {isSuccess && <span className={styles.mark}>
      <svg viewBox="0 0 24 24" className={styles.check}><path d="M6.5 12.5l3.5 3.5 7.5-8" pathLength={1} /></svg>
    </span>}
  </div>;
}

function InlineStateLabel({ label, pending }: { label: string; pending: boolean }) {
  return <div className={styles.inlineLabel}>
    <Text key={label} type="body" weight="medium" role="status" className={styles.inlineLabelText} data-pending={pending ? '' : undefined}>
      {label}
    </Text>
  </div>;
}

function PaymentActions({ mode, error }: Pick<PaymentCardProps, 'mode' | 'error'>) {
  const editing = mode === 'editing';
  const terminal = mode === 'confirming' || mode === 'sending' || mode === 'sent' || mode === 'cancelled';
  const primary = <span data-payment-action={editing ? 'save' : 'accept'}><Button label={editing ? 'Review changes' : 'Confirm'}
    variant="primary" className={styles.chip} isDisabled={Boolean(error)} /></span>;
  const edit = !editing && mode !== 'funding' && <span data-payment-action="edit"><Button label="Edit" className={styles.chip} /></span>;
  const cancel = <span data-payment-action="cancel"><Button label="Cancel" variant="ghost" className={styles.chip} /></span>;
  // Cancel · Edit · Confirm, pushed right so the primary sits under the thumb
  // (2026-10-07 voice, extended to chat 2026-10-09); DOM order matches visual.
  return <div className={styles.actionsViewport} data-hidden={terminal ? '' : undefined} inert={terminal} aria-hidden={terminal}>
    <div className={styles.actions}>
      {cancel}{edit}{primary}
    </div>
  </div>;
}

export function PaymentCard(props: PaymentCardProps) {
  const root = useRef<HTMLDivElement>(null);
  const inline = props.presentation === 'inline';
  const editing = props.mode === 'editing';
  const success = props.mode === 'sent';
  const pending = props.mode === 'sending';
  const inlineLabel = pending ? 'Sending…' : success ? 'Transfer complete.' : props.title;
  return <div ref={root} className={styles.root} data-payment-card={props.mode}>
    <Card variant={success && !inline ? 'green' : 'default'} padding={0} className={styles.card ?? ''}>
      {!inline && <header className={styles.header}><Text type="body" weight="medium">{props.title}</Text></header>}
      {editing ? <div className={styles.fields}>
        <div data-payment-field="amount"><TextInput label="Amount in USD" value={props.amount}
          onChange={(value) => root.current?.setAttribute('data-payment-amount', value)} /></div>
        <div data-payment-field="purpose"><TextInput label="Payment note" value={props.purpose}
          onChange={(value) => root.current?.setAttribute('data-payment-purpose', value)} /></div>
      </div> : <>
        <TransferRoute recipient={props.recipient} isSuccess={success} isPending={inline && pending} inline={inline} />
        {inline && <InlineStateLabel label={inlineLabel} pending={pending} />}
        <div className={styles.summary}>
          <Text type="display-1" className={heroBalanceStyles.heroAmount} hasTabularNumbers display="block">${props.amount}</Text>
          <div className={styles.meta}>
            <div className={styles.metaRow}><Text type="supporting" color="secondary">Arrives</Text>
              <Text type="body">{props.arrival}</Text></div>
            <div className={styles.metaRow}><Text type="supporting" color="secondary">Network fee</Text>
              <Text type="body">{props.fee}</Text></div>
          </div>
        </div>
      </>}
      {editing && <Text type="supporting" color="secondary">Main balance: {props.balance}</Text>}
      {props.error && <Text role="alert">{props.error}</Text>}
      <PaymentActions mode={props.mode} error={props.error} />
    </Card>
    {props.note && <Text type="supporting" color="secondary">{props.note}</Text>}
  </div>;
}
