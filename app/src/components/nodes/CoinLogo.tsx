import { cryptoArtwork } from '../../assets/identity/artwork';
import { AssetLogo } from './AssetLogo';
import styles from './CoinLogo.module.css';

export function CoinLogo({ entityId }: { entityId: string; label: string }) {
  const logo = cryptoArtwork(entityId);
  if (!logo) return <AssetLogo id={entityId} size="compact" />;
  const image = <img className={logo.onPlate ? styles.glyph : styles.mark} src={logo.src} alt="" aria-hidden="true" />;
  return logo.onPlate ? <div className={styles.plate}>{image}</div> : image;
}
