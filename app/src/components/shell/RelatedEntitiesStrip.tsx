import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { Text } from '@astryxdesign/core/Text';
import { AssetLogo } from './AssetLogo';

interface RelatedEntity {
  id: string;
  name: string;
  type: string;
}

// "Related/compare" strip (Phase 16 revision) — venue peers or sector
// peers, small card row. Deliberately NOT entity-header itself (that
// node's own vocabulary caps at 3-5 attributes for a full-width band; a
// tiny card here needs less than that) — a lighter echo reusing the same
// AssetLogo identity glyph the Discover grid and strips already
// established, so a related entity reads as the same kind of object
// wherever it appears. Click browses to that entity's own detail page
// (same "browse first" law as the grid), never straight into an
// investigation.
export function RelatedEntitiesStrip({ entities, onOpen }: { entities: RelatedEntity[]; onOpen: (id: string) => void }) {
  if (entities.length === 0) return null;
  return (
    <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
      <Text type="label">Related</Text>
      {/* auto-fit, not a fixed repeat(entities.length, ...) — the fixed
          version couldn't reflow at all (found live, Demo Flow #1 order):
          3 columns × 160px minimum forced a ~500px floor regardless of
          available width, overflowing once the artifact/transcript panes
          narrow this page's own content column. */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-12)' }}>
        {/* panelFlat (Panel.tsx's own class, theme files) — transparent
            background + edge-only border, no elevation at rest. Reused
            here rather than duplicated (direct feedback, 2026-08-02):
            ClickableCard's built-in hover overlay still applies
            regardless of className, so this reads as a plain outlined
            surface until hover. */}
        {entities.map((related) => (
          <ClickableCard key={related.id} label={`Open ${related.name}`} variant="default" className="panelFlat" padding={3} onClick={() => onOpen(related.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
              <AssetLogo id={related.id} />
              <div>
                <Text type="body" weight="semibold" display="block">
                  {related.name}
                </Text>
                <Text type="supporting" color="secondary">
                  {related.type}
                </Text>
              </div>
            </div>
          </ClickableCard>
        ))}
      </div>
    </div>
  );
}
