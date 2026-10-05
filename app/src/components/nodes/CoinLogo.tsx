import ethLogo from '../../assets/coin-logos/eth.svg';
import solLogo from '../../assets/coin-logos/sol.svg';
import usdcLogo from '../../assets/coin-logos/usdc.svg';
import usdtLogo from '../../assets/coin-logos/usdt.svg';
import galaLogo from '../../assets/coin-logos/gala.svg';
import styles from './CoinLogo.module.css';

// Shared logo primitive; static sources and attribution are retained.
const LOGOS: Record<string, string> = {
  eth: ethLogo,
  sol: solLogo,
  usdc: usdcLogo,
  usdt: usdtLogo,
  gala: galaLogo,
};

export function CoinLogo({ entityId, label }: { entityId: string; label: string }) {
  const src = LOGOS[entityId];
  if (!src) return <div className={styles.fallback} aria-hidden="true">{label.slice(0, 2)}</div>;
  return <img className={styles.mark} src={src} alt="" aria-hidden={!label} />;
}
