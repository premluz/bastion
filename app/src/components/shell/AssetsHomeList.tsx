import type { AssetHomeRow } from '../../engine/assetsHome';
import { ownedAssetsScene } from '../../engine/ownedAssetsScene';
import { SceneRenderer } from '../../renderer/SceneRenderer';
import styles from './AssetsHomeList.module.css';

// No click-to-select (2026-10-06, direct feedback): rows only hover. Their
// placeholder #owned/<id> links are still held back from navigating, since
// no asset-detail screen exists yet.
export function AssetsHomeList({ rows }: { rows: AssetHomeRow[] }) {
  return <div className={styles.list} onClick={(event) => {
    if (event.target instanceof Element && event.target.closest('[data-asset-id]')) event.preventDefault();
  }}><SceneRenderer scene={ownedAssetsScene(rows)} /></div>;
}
