import { RollingText } from './RollingText';
import '../../theme/money.css';
import styles from './MoneyText.module.css';

const CENTS = /^(.*?)(\.\d+)$/;

// An amount whose decimals are set smaller and subtler (theme/money.css); the setting lives in Settings. Text with no
// decimals, such as the masked balance, is shown whole.
export function MoneyText({ text }: { text: string }) {
  const match = CENTS.exec(text);
  if (!match) return <RollingText text={text} />;
  const [, whole = '', cents = ''] = match;
  return <><RollingText text={whole} /><span className={styles.cents}><RollingText text={cents} /></span></>;
}
