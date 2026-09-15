import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import styles from './VirtualCardPlaceholder.module.css';

export interface VirtualCardPlaceholderProps { lastFourDigits: string }

// Placeholder card art (2026-09-15, direct feedback: "Card asset will
// have bg logo (bastion) logo (visa) and 3 last digits (as text) virtual
// card as text also. I will provide these assets later, just make
// placeholders") — ShieldCheckIcon stands in for Bastion's own mark, and
// "VISA" is set as plain text rather than a fabricated network logo. All
// of this is meant to be swapped for real art/logos once provided; no
// numbers here are real card data.
export function VirtualCardPlaceholder({ lastFourDigits }: VirtualCardPlaceholderProps) {
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <div className={styles.design}>
          <div className={styles.topRow}>
            <span className={styles.brand}>
              <Icon icon={ShieldCheckIcon} size="lg" />
              <Text type="body" weight="semibold">Bastion</Text>
            </span>
            <Text type="supporting" color="secondary">Virtual Card</Text>
          </div>
          <div className={styles.bottomRow}>
            <Text type="large" weight="semibold" hasTabularNumbers className={styles.digits}>
              •••• {lastFourDigits}
            </Text>
            <Text type="body" weight="semibold" className={styles.network}>VISA</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
