import type { AssetHomeRow } from '../../engine/assetsHome';
import { ownedAssetsScene } from '../../engine/ownedAssetsScene';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import styles from './AssetsHomeList.module.css';

export function AssetsHomeList({ rows, selectedAssetId, onSelectAsset }: {
  rows: AssetHomeRow[];
  selectedAssetId?: string | null;
  onSelectAsset?: (entityId: string | null) => void;
}) {
  return <div className={styles.list} onClick={(event) => {
    if (!(event.target instanceof Element)) return;
    const id = event.target.closest('[data-asset-id]')?.getAttribute('data-asset-id');
    if (!id) return;
    event.preventDefault();
    onSelectAsset?.(id === selectedAssetId ? null : id);
  }}><SceneRenderer scene={ownedAssetsScene(rows, selectedAssetId)} /></div>;
}
