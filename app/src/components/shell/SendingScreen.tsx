import { Avatar } from '@astryxdesign/core/Avatar';
import { Button } from '@astryxdesign/core/Button';
import { Dialog } from '@astryxdesign/core/Dialog';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import '../../theme/sending.css';
import styles from './SendingScreen.module.css';

export interface SendingParty { name: string; src?: string }
export interface SendingScreenProps {
  phase: 'processing' | 'success';
  amount: string;
  sender: SendingParty;
  recipient: SendingParty;
  onCancel: () => void;
  onDone: () => void;
}

// Astryx's numeric Avatar scale; must equal --send-avatar-size (64px),
// which the success converge distance is computed from.
const AVATAR_SIZE = 64;

function PartyAvatar({ party, side }: { party: SendingParty; side: 'from' | 'to' }) {
  return <span className={styles.party} data-side={side}>
    {party.src ? <Avatar name={party.name} src={party.src} size={AVATAR_SIZE} /> : <Avatar name={party.name} size={AVATAR_SIZE} />}
  </span>;
}

// Simulated transfer in flight, then landed: calm ripples and chevrons while
// processing; on success the glow turns green, the avatars meet in the
// middle and a check draws itself inside a green mark.
export function SendingScreen({ phase, amount, sender, recipient, onCancel, onDone }: SendingScreenProps) {
  const done = phase === 'success';
  return (
    <Dialog isOpen onOpenChange={(open) => { if (!open) (done ? onDone : onCancel)(); }}
      variant="fullscreen" purpose="form" padding={0} className={styles.root}
      aria-label={done ? `Sent ${amount} to ${recipient.name}` : `Sending ${amount} to ${recipient.name}`}
      data-sending-screen={phase}>
      <div className={styles.layout} data-phase={phase}>
        <div className={styles.summary}>
          <Heading level={1} type="display-1" className={styles.amount}>{amount}</Heading>
          <Text color="secondary">to {recipient.name}</Text>
        </div>
        <div className={styles.stage} aria-hidden="true">
          <span className={styles.glow} />
          <span className={styles.glowDone} />
          <span className={styles.ripple} />
          <span className={styles.ripple} />
          <span className={styles.ripple} />
          <div className={styles.lane}>
            <PartyAvatar party={sender} side="from" />
            <span className={styles.chevrons}>
              <ChevronRightIcon className={styles.chevron} />
              <ChevronRightIcon className={styles.chevron} />
              <ChevronRightIcon className={styles.chevron} />
            </span>
            <PartyAvatar party={recipient} side="to" />
          </div>
          <span className={styles.mark}>
            <svg viewBox="0 0 24 24" className={styles.check}><path d="M6.5 12.5l3.5 3.5 7.5-8" pathLength={1} /></svg>
          </span>
        </div>
        <Text role="status" className={styles.status}>
          {done ? `${amount} sent to ${recipient.name}` : <span className={styles.shimmer}>Processing…</span>}
        </Text>
        <div className={styles.footer}>
          <Button label={done ? 'Done' : 'Cancel'} variant="ghost" className={styles.action} onClick={done ? onDone : onCancel} />
        </div>
      </div>
    </Dialog>
  );
}
