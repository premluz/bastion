import { Fragment } from 'react';
import { Carousel } from '@astryxdesign/core/Carousel';
import { Badge } from '@astryxdesign/core/Badge';
import { Text } from '@astryxdesign/core/Text';
import { AnimatedListItem } from './AnimatedListItem';
import { PageSection } from './PageSection';
import { DiscoveryItemRow, type DiscoveryRow } from './DiscoveryItemRow';
import styles from './EntityDiscoveryStrips.module.css';

export type { DiscoveryRow };

interface EntityDiscoveryStripsProps {
  movers: DiscoveryRow[];
  trending: DiscoveryRow[];
  newlyAdded: DiscoveryRow[];
  onOpenDetail: (id: string) => void;
}

// Three top strips (Phase 14; unified-template + naming follow-up,
// 2026-07-20), one shared row shape (DiscoveryRow) and one shared row
// renderer (DiscoveryItemRow.tsx, extracted out of this file 2026-08-19
// — direct feedback: "actually in related use item comp that is used in
// notable movers... if we have this as comp that item that's great lets
// have it in peers" — RelatedEntitiesStrip.tsx/Peers is the second real
// consumer of that extraction). No divider between rows (removed
// 2026-08-08, direct feedback) — rows are separated by spacing/hover
// alone now. Every row hovers, unconditionally (`.astryx-item:hover` in
// theme.default.css, all-themes) — every row is now genuinely clickable
// (see below), so this no longer needs the earlier "hover even on rows
// with nothing to click" exception it once was.
//
// EVERY row browses to its own detail page, unconditionally (2026-08-19,
// direct feedback: "ensure zenith is notable movers pane and that south
// bow links to page, and all should link to details page not to trigger
// investigation") — reverses the earlier "click submits an investigation,
// gated on row.intent existing" behavior: rows with no `intent` simply
// weren't clickable at all before this, which is the real reason South
// Bow Corp had no click path from these strips. `onOpenDetail(row.id)`
// (openEntityDetail, "browse first" — the same law DiscoverAssetsSection's
// own grid/table already follow) replaces `onInvestigate(intent)`
// entirely; `DiscoveryRow.intent` removed from the type since nothing
// reads it anymore (EntitiesPage.tsx's separate "Other tracked entities"
// list still has its own distinct, explicit Investigate button — a
// different, already-correct pattern, untouched by this change).
function DiscoveryStripList({
  rows,
  emptyLabel,
  onOpenDetail,
  startIndex,
}: {
  rows: DiscoveryRow[];
  emptyLabel: string;
  onOpenDetail: (id: string) => void;
  startIndex: number;
}) {
  if (rows.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        {emptyLabel}
      </Text>
    );
  }
  return (
    <>
      {rows.map((row, index) => {
        const animationIndex = startIndex + index;
        return (
          <Fragment key={row.id}>
            <AnimatedListItem index={animationIndex}>
              <DiscoveryItemRow row={row} onOpenDetail={onOpenDetail} />
            </AnimatedListItem>
          </Fragment>
        );
      })}
    </>
  );
}

// Notable movers' title carries a trailing Badge ("24H") beside the label —
// passed as PageSection's `title` ReactNode rather than its own prop, since
// this is the only one of the three strips with a second element in its
// header and doesn't warrant widening PageSection's API for one caller.
const notableMoversTitle = (
  <div className={styles.identityRow}>
    <Text type="label">Notable movers</Text>
    <Badge variant="neutral" label="24H" />
  </div>
);

// Grid-first, Carousel as the overflow escape hatch (2026-08-18 follow-up
// — reverses the immediately-prior "always Carousel" swap: direct
// feedback "should always stretch across these panes to full width of
// container, only when they reached their min width so can't shrink more
// then reflow into carousel"). Both a CSS grid (.grid, 3 even
// minmax(440px, 1fr) columns — fills the container's full width, per the
// ask, never shrinking a strip below its own genuine minimum) and a
// Carousel render into the DOM at once; a container query (@container,
// EntityDiscoveryStrips.module.css) shows exactly one of the two based
// on the container's real available width against that same 440px
// minimum, never a JS remount — Carousel keeps its own internal scroll/
// button state intact if the container crosses the threshold back and
// forth, and the grid needs no measurement logic of its own since
// @container already reads the real box. PageSection cards are authored
// ONCE (stripPanels below) and referenced from both branches so the two
// never drift out of sync with each other's content. Both branches stay
// mounted simultaneously (CSS display toggle, not conditional render) —
// a deliberate tradeoff: each strip's own AnimatedListItem rows exist
// twice in the DOM (confirmed live, 18 .astryx-item nodes for 3 strips ×
// 3 rows × 2 branches), but this is what lets Carousel's scroll position
// survive a threshold crossing; the display:none branch never paints or
// runs its entrance animation visibly, confirmed via live screenshot at
// initial mount showing no doubling or flash. hasSnap (2026-08-18 same-
// round addition, direct feedback: "should snap also") — each Carousel
// item snaps to the scroll-start edge per Astryx's own prop.
export function EntityDiscoveryStrips({ movers, trending, newlyAdded, onOpenDetail }: EntityDiscoveryStripsProps) {
  const stripPanels = [
    <PageSection key="movers" title={notableMoversTitle}>
      <DiscoveryStripList rows={movers} emptyLabel="No market data this session." onOpenDetail={onOpenDetail} startIndex={0} />
    </PageSection>,
    <PageSection key="trending" title="Trending">
      <DiscoveryStripList rows={trending} emptyLabel="Nothing cited yet this session." onOpenDetail={onOpenDetail} startIndex={movers.length} />
    </PageSection>,
    <PageSection key="newlyAdded" title="Newly Added">
      <DiscoveryStripList rows={newlyAdded} emptyLabel="Nothing to show." onOpenDetail={onOpenDetail} startIndex={movers.length + trending.length} />
    </PageSection>,
  ];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {stripPanels.map((panel, index) => (
          <div key={index}>{panel}</div>
        ))}
      </div>
      <div className={styles.carouselWrap}>
        <Carousel gap={2} hasSnap aria-label="Discovery strips">
          {stripPanels.map((panel, index) => (
            <div key={index} className={styles.stripItem}>
              {panel}
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
}
