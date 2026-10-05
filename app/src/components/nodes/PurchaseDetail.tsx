import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
import type { PurchaseDetailProps } from '../../contracts/props/purchase-card';
import '../../theme/purchase.css';
import styles from './Purchase.module.css';

export function PurchaseDetail({ label, value, kind, confirmed }: PurchaseDetailProps) {
  if (kind === 'confirm') return <div className={styles.confirm}>
    <Button label={confirmed ? 'Purchase simulated' : label} data-purchase-confirm="true" isDisabled={confirmed} />
    <Text type="supporting" color="secondary">Demo quote · No real funds move</Text>
  </div>;
  return <div className={styles.detail} data-kind={kind}>
    <Text color="secondary">{label}</Text>
    <Text type={kind === 'amount' ? 'large' : 'body'} hasTabularNumbers>{value}</Text>
  </div>;
}
