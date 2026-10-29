import { useState } from 'react';
import { Icon } from '@astryxdesign/core/Icon';
import { BuildingLibraryIcon, BuildingOffice2Icon, ChartBarSquareIcon, CircleStackIcon, CubeIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { cryptoArtwork, fiatFlag, forexFlags, marketArtwork } from '../../assets/identity/artwork';
import styles from './AssetLogo.module.css';

const MOCK_ICONS = {
  'covered-bond': BuildingLibraryIcon,
  'real-estate': BuildingOffice2Icon,
  'credit-fund': CircleStackIcon,
  commodities: CubeIcon,
  crypto: CircleStackIcon,
} as const;
const SCENE_ICONS: Record<string, typeof CubeIcon> = {
  gold: CubeIcon, silver: CubeIcon,
  spy: ChartBarSquareIcon, qqq: ChartBarSquareIcon, bwts: ChartBarSquareIcon,
  perpspad: CircleStackIcon, flame: CircleStackIcon,
};

function categoryIcon(id: string) {
  const sceneIcon = SCENE_ICONS[id];
  if (sceneIcon) return sceneIcon;
  const category = Object.entries(MOCK_ICONS).find(([key]) => id.startsWith(`mock-${key}-`));
  return category?.[1] ?? Squares2X2Icon;
}
export function AssetLogo({ id, size = 'default' }: { id: string; size?: 'compact' | 'default' | 'large' }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const artwork = cryptoArtwork(id) ?? marketArtwork(id);
  const flags = forexFlags(id);
  const flag = fiatFlag(id);
  if (flag) return <span className={styles.root} data-size={size} aria-hidden="true">
    <img className={styles.flag} src={flag} alt="" />
  </span>;
  if (flags) return <span className={styles.root} data-size={size} data-variant="forex" aria-hidden="true">
    <span className={styles.flagPair}>
      <img src={flags[0]} alt="" /><img src={flags[1]} alt="" />
    </span>
  </span>;
  if (artwork && failedSource !== artwork.src) {
    return <span className={styles.root} data-size={size}>
      <img className={artwork.onPlate ? styles.glyph : styles.mark} src={artwork.src} alt="" onError={() => setFailedSource(artwork.src)} />
    </span>;
  }
  return <span className={styles.root} data-size={size} aria-hidden="true">
    <Icon icon={categoryIcon(id)} size="sm" />
  </span>;
}
