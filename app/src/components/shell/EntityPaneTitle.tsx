import { Text } from '@astryxdesign/core/Text';
import { AssetLogo } from '../nodes/AssetLogo';
import styles from './EntityPaneTitle.module.css';

// Entity Detail's own pane-title composition (2026-08-19, direct
// feedback: "title of entity detail should be only the one pane title
// not the one below tabs, but move logo to the left of pane title and
// under it move ticker") — replaces AssetOverviewTab's own
// AssetIdentityHeader (deleted the same round; its whole job, announcing
// the entity's identity, now belongs to the page's one title). Passed to
// PageShell as `titleContent` (PaneTitleBar.tsx's own new prop, kept
// separate from the plain-string `title` every other page still uses) —
// this is the ONE place on the page the entity's name/ticker render,
// not a second instance further down.
export function EntityPaneTitle({ id, name, symbol }: { id: string; name: string; symbol: string }) {
  return (
    <div className={styles.root}>
      <AssetLogo id={id} />
      <div className={styles.textColumn}>
        <Text type="large" weight="semibold" display="block" className={styles.name}>
          {name}
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers display="block">
          {symbol}
        </Text>
      </div>
    </div>
  );
}
