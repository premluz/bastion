import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { AssetCardGridProps } from '../../contracts/props/asset-card-grid';
import { AssetCardVisual } from './AssetCardVisual';
import '../../theme/asset-card-carousel.css';
import styles from './AssetCardGrid.module.css';

// Registry node (Phase 21, 2026-08-30) — the Scene-JSON-driven half of
// "one card system serves both human browsing and assistant generation"
// (CLAUDE.md's own Phase 21 law). Renders the SAME AssetCardVisual
// EntityAssetGrid.tsx uses for the Discover page's own card grid, so an
// inline-in-transcript result (e.g. "what are the hottest crypto this
// week") shows the same card as browsing Discover directly. The layout
// differs (2026-10-11, direct feedback): this
// mounts in the transcript, a narrow column, where a grid squashed the cards
// into two thin columns — so here the cards are a horizontal scroll-snap
// carousel, each at a comfortable fixed width. Discover's own grid
// (EntityAssetGrid.tsx) keeps config.assetCardGrid's responsive columns.
//
// Click reaches out via data-entity-id, never a callback prop (CLAUDE.md
// rule 7 — "never callbacks, never engine/app imports" — EntityLink.tsx
// is the reference implementation this follows, just on the whole card's
// wrapper div instead of a text span). Whatever mounts this node owns the
// actual navigation: Transcript.tsx attaches its own delegated listener
// at the transcript's own mount point, the same two-line pattern
// Canvas.tsx already uses for the artifact stack (resolveClickedEntityId
// + openEntityDetail) — SceneRenderer itself carries no click delegation
// of its own, by design (CLAUDE.md rule 6, "components are pure and
// dumb").
//
// ClickableCard, not plain Card (2026-08-30 follow-up, direct feedback:
// "we should have hover also on these cards currently no hover") — its
// own onClick prop is left UNSET (a real callback prop would violate
// rule 7), used here purely for the hover/active/focus-ring chrome it
// already builds in, matching EntityAssetGrid.tsx's own card exactly.
// `label` is a plain string (aria-label only), not a callback, so it's
// fine to pass. ClickableCard's internal hidden <button> still lets a
// real click bubble up to the transcript's own delegated listener —
// confirmed via its own source: the surface has no onClick wired here,
// so nothing intercepts the bubble before it reaches data-entity-id.
export function AssetCardGrid({ data }: AssetCardGridProps) {
  if (data.entities.length === 0) {
    return <EmptyState title="No assets" description="No entities returned for this query." />;
  }

  return (
    <div className={styles.track} role="group" aria-label="Assets">
      {data.entities.map((entity) => (
        // data-entity-id only, no role/onClick baked in here — same posture
        // as EntityLink.tsx (rule 7's reference implementation): this node
        // states WHICH entity a click on this element means, never HOW that
        // click should be handled. Whatever mounts the scene (Transcript.tsx)
        // decides that, via its own delegated listener.
        <ClickableCard
          key={entity.id}
          label={`Open ${entity.name}`}
          variant="default"
          padding={4}
          className="cardSurface1"
          data-entity-id={entity.id}
        >
          <AssetCardVisual id={entity.id} name={entity.name} type={entity.type} formattedValue={entity.value} deltaPercent={entity.deltaPercent} />
        </ClickableCard>
      ))}
    </div>
  );
}
