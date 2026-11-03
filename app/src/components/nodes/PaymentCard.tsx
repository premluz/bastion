import { useRef } from 'react';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { ChevronRightIcon, CurrencyDollarIcon, HomeIcon, WalletIcon } from '@heroicons/react/24/outline';
import { avatarProps, USER_NAME } from '../../avatars';
import { RollingText } from '../trail/RollingText';
import type { PaymentCardProps, PaymentParty } from '../../contracts/props/payment-card';
import '../../theme/approval.css';
import heroBalanceStyles from '../../theme/heroBalance.module.css';
import '../../theme/sending.css';
import styles from './PaymentCard.module.css';


// Fills the 64px route disc (--send-avatar-size) so no band of the disc
// shows around it as a darker ring (2026-10-06, direct feedback).
const AVATAR_SIZE = 64;
const ACCOUNT_ICON = { wallet: WalletIcon, house: HomeIcon, coin: CurrencyDollarIcon } as const;

// A person is their avatar; one of the user's own accounts is its icon (2026-10-31, direct feedback: Prem's photo and
// "MA" read as money going to someone else, when both ends are Prem's).
function PartyDisc({ party }: { party: PaymentParty }) {
  if (!party.icon) return <Avatar {...avatarProps(party.name)} size={AVATAR_SIZE} />;
  const Icon = ACCOUNT_ICON[party.icon];
  return <Icon className={styles.accountIcon} />;
}

function TransferRoute({ from, to, isSuccess, isPending, inline }: {
  from: PaymentParty; to: PaymentParty; isSuccess: boolean; isPending: boolean; inline: boolean;
}) {
  return <div className={styles.route} data-success={isSuccess ? '' : undefined}
    data-pending={isPending ? '' : undefined} data-inline={inline ? '' : undefined} aria-hidden="true">
    {isPending && <>
      <span className={styles.ripple} />
      <span className={styles.ripple} />
      <span className={styles.ripple} />
    </>}
    {(!isSuccess || inline) && <>
      <span className={styles.party} data-side="from"><span className={styles.disc}><PartyDisc party={from} /></span></span>
      <span className={styles.chevrons}>
        <ChevronRightIcon className={styles.chevron} />
        <ChevronRightIcon className={styles.chevron} />
        <ChevronRightIcon className={styles.chevron} />
      </span>
      <span className={styles.party} data-side="to"><span className={styles.disc}><PartyDisc party={to} /></span></span>
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

// Each end's name and what the transfer does to it, centred under its disc. Once the transfer lands the caption rolls to
// its outcome and stays (2026-10-31, direct feedback: the result is left on screen, not tidied away): "$3,475.45 →
// $3,285.45" closes up to "$3,285.45", only the part that changed moving.
function PartyCaptions({ from, to, isLanded }: { from: PaymentParty; to: PaymentParty; isLanded: boolean }) {
  return <div className={styles.ends}>
    {([['from', from], ['to', to]] as const).map(([side, party]) => <div key={side} className={styles.end} data-side={side}>
      <Text type="supporting" weight="medium">{party.name}</Text>
      {party.caption && <Text type="supporting" color="secondary" hasTabularNumbers>
        <RollingText text={isLanded && party.outcome ? party.outcome : party.caption} />
      </Text>}
    </div>)}
  </div>;
}

function PaymentActions({ mode, error }: Pick<PaymentCardProps, 'mode' | 'error'>) {
  const editing = mode === 'editing';
  const terminal = mode === 'confirming' || mode === 'sending' || mode === 'sent' || mode === 'cancelled';
  const primary = <span data-payment-action={editing ? 'save' : 'accept'}><Button label={editing ? 'Review changes' : 'Confirm'}
    variant="primary" className={styles.chip} isDisabled={Boolean(error)} /></span>;
  const cancel = <span data-payment-action="cancel"><Button label="Not now" variant="ghost" className={styles.chip} /></span>;
  // Not now · Confirm, pushed right so the primary sits under the thumb (2026-10-07 voice, extended to chat 2026-10-09);
  // no Edit (2026-10-31, direct feedback: three equal buttons were too many). DOM order matches visual.
  return <div className={styles.actionsViewport} data-hidden={terminal ? '' : undefined} inert={terminal} aria-hidden={terminal}>
    <div className={styles.actions}>
      {cancel}{primary}
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
  const from = props.from ?? { name: USER_NAME };
  const isCaptioned = Boolean(from.caption || props.to.caption);
  return <div ref={root} className={styles.root} data-payment-card={props.mode} data-captioned={isCaptioned ? '' : undefined}>
    <Card variant={success && !inline ? 'green' : 'default'} padding={0} className={styles.card ?? ''}>
      {!inline && <header className={styles.header}><Text type="body" weight="medium">{props.title}</Text></header>}
      {editing ? <div className={styles.fields}>
        <div data-payment-field="amount"><TextInput label="Amount in USD" value={props.amount}
          onChange={(value) => root.current?.setAttribute('data-payment-amount', value)} /></div>
        <div data-payment-field="purpose"><TextInput label="Payment note" value={props.purpose}
          onChange={(value) => root.current?.setAttribute('data-payment-purpose', value)} /></div>
      </div> : <>
        <TransferRoute from={from} to={props.to} isSuccess={success} isPending={inline && pending} inline={inline} />
        {isCaptioned && <PartyCaptions from={from} to={props.to} isLanded={success} />}
        {inline && <InlineStateLabel label={inlineLabel} pending={pending} />}
        <div className={styles.summary}>
          <Text type="display-1" className={heroBalanceStyles.heroAmount} hasTabularNumbers display="block">${props.amount}</Text>
          {props.details.length > 0 && <div className={styles.meta}>
            {props.details.map((detail) => <div key={detail.label} className={styles.metaRow}>
              <Text type="supporting" color="secondary" className={styles.metaLabel}>{detail.label}</Text>
              <Text type="supporting" color="secondary" hasTabularNumbers className={styles.metaValue}>{detail.value}</Text>
            </div>)}
          </div>}
        </div>
      </>}
      {editing && <Text type="supporting" color="secondary">Main balance: {props.balance}</Text>}
      {props.error && <Text role="alert">{props.error}</Text>}
      <PaymentActions mode={props.mode} error={props.error} />
    </Card>
    {props.note && <Text type="supporting" color="secondary">{props.note}</Text>}
  </div>;
}
