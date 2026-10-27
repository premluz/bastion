import ethLogo from '../../assets/coin-logos/eth.svg';
import solLogo from '../../assets/coin-logos/sol.svg';
import usdcLogo from '../../assets/coin-logos/usdc.svg';
import usdtLogo from '../../assets/coin-logos/usdt.svg';
import galaLogo from '../../assets/coin-logos/gala.svg';
import styles from './CoinLogo.module.css';

// Shared logo primitive; static sources and attribution are retained.
// `isRound`: the artwork is already a circle and fills the logo's box; a bare mark (the diamond, the shield,
// the cube) sits on a circular plate instead (2026-10-27, direct feedback: logos within a circle, like the
// trending and activity rows and the suggestion icons).
const LOGOS: Record<string, { src: string; isRound: boolean }> = {
  eth: { src: ethLogo, isRound: false },
  sol: { src: solLogo, isRound: true },
  usdc: { src: usdcLogo, isRound: true },
  usdt: { src: usdtLogo, isRound: false },
  gala: { src: galaLogo, isRound: false },
};

export function CoinLogo({ entityId, label }: { entityId: string; label: string }) {
  const logo = LOGOS[entityId];
  if (!logo) return <div className={styles.fallback} aria-hidden="true">{label.slice(0, 2)}</div>;
  const image = <img className={logo.isRound ? styles.mark : styles.glyph} src={logo.src} alt="" aria-hidden={!label} />;
  return logo.isRound ? image : <div className={styles.plate}>{image}</div>;
}
