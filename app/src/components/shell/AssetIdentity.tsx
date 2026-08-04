import { Text } from '@astryxdesign/core/Text';
import { AssetLogo } from './AssetLogo';

interface AssetIdentityProps {
  id: string;
  name: string;
  type: string;
}

// The one "logo left, name on top / type descriptor underneath" pattern —
// systematized (direct feedback, 2026-08-02) after it was hand-duplicated
// in EntityAssetTableCells.tsx's Asset cell and EntityAssetGrid.tsx's card
// header. Text/ellipsis behavior is identical in both contexts (a fixed-
// width table cell and a card that can still get narrow), so this always
// truncates rather than needing a variant prop for it.
export function AssetIdentity({ id, name, type }: AssetIdentityProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
      <AssetLogo id={id} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <Text type="body" weight="semibold" display="block" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </Text>
        <Text type="supporting" color="secondary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {type}
        </Text>
      </div>
    </div>
  );
}
