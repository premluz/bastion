import type { ReactNode } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import type { PurchaseCardProps } from '../../contracts/props/purchase-card';
import eth from '../../assets/coin-logos/eth.svg';
import usdt from '../../assets/coin-logos/usdt.svg';
import usdc from '../../assets/coin-logos/usdc.svg';
import glow from '../../theme/glow.module.css';
import '../../theme/purchase.css';
import styles from './Purchase.module.css';

export function PurchaseCard({ title, currency, children }: PurchaseCardProps & { children?: ReactNode }) {
  return <Card padding={0} className={`${styles.purchase} ${glow.root} ${glow.bottom} ${glow.clipped}`}>
    <div className={glow.content}>
      <header className={styles.cardHeader}><Heading level={2} type="display-3">{title}</Heading>
        <span className={styles.coins}><img src={currency === 'USDT' ? usdt : usdc} alt={currency} />
          <Icon icon="chevronRight" /><img src={eth} alt="ETH" /></span>
      </header>
      <div className={styles.details}>{children}</div>
    </div>
  </Card>;
}
