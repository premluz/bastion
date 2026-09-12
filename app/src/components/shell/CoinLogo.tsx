import ethLogo from '../../assets/coin-logos/eth.svg';
import solLogo from '../../assets/coin-logos/sol.svg';
import usdcLogo from '../../assets/coin-logos/usdc.svg';
import usdtLogo from '../../assets/coin-logos/usdt.svg';
import galaLogo from '../../assets/coin-logos/gala.svg';
import styles from './CoinLogo.module.css';

// Real per-ticker brand marks (see app/src/assets/coin-logos/NOTICE.md for
// source/license) — a different mechanism from nodes/AssetLogo.tsx's
// generic placeholder marks (public/logos/, hashed-to-a-random-file, no
// per-entity correspondence): this page renders actual known holdings, so
// each entity id maps to its own real logo via a static import, not a
// deterministic-but-arbitrary pick from a shared pool. Not a registry
// node — this page is app-shell chrome, same exemption TabBar/PageSection
// already document.
const LOGOS: Record<string, string> = {
  eth: ethLogo,
  sol: solLogo,
  usdc: usdcLogo,
  usdt: usdtLogo,
  gala: galaLogo,
};

export function CoinLogo({ entityId, label }: { entityId: string; label: string }) {
  const src = LOGOS[entityId];
  if (!src) return <div className={styles.fallback} aria-hidden="true" />;
  return <img className={styles.mark} src={src} alt="" aria-hidden={!label} />;
}
