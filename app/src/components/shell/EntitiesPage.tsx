import { useMemo } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import entitiesJson from '../../../universe/entities.json';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { submitQuery } from '../../engine/submitQuery';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { getMarketAssets, rankMovers, getNewlyAdded, SPARKLINE_WINDOW } from '../../engine/assetDiscovery';
import { getMockFilledAssets, mockSparkline } from '../../engine/assetDiscoveryMock';
import { resolveEntityDetail, type EntityDetail } from '../../engine/entityDetail';
import { usePageStore } from '../../engine/stores/pageStore';
import { PageShell } from './PageShell';
import { EntityDiscoveryStrips, type DiscoveryRow } from './EntityDiscoveryStrips';
import { EntityAssetGrid } from './EntityAssetGrid';

interface UniverseEntityRecord {
  entity: { id: string; name: string; type: string };
  intent?: string;
}

const entities = Object.values(entitiesJson as Record<string, UniverseEntityRecord>);
const marketAssets = getMarketAssets();
const marketAssetById = new Map(marketAssets.map((asset) => [asset.id, asset]));
const intentById = new Map(
  entities.filter((record): record is UniverseEntityRecord & { intent: string } => !!record.intent).map((record) => [record.entity.id, record.intent]),
);
const otherEntities = entities.filter(({ entity }) => !marketAssetById.has(entity.id));

// "Trending" — session-fixed like "Newly added" below, not a live
// citation count: Phase 14 shipped this as a turns-derived counter that
// read as permanently blank until a query actually cited something in a
// fresh session — direct feedback (2026-07-25) asked for it populated on
// load instead. Three real, already-authored entities, curated for
// narrative variety against Notable movers' own top-3 (the Solent bonds
// ranked by |delta|) rather than re-showing them.
const TRENDING_ENTITY_IDS = ['south-bow-corp', 'aldergate-estates', 'kestrel-holdings'] as const;

// Kestrel Holdings carries no chart series (it's a counterparty, not a
// priced asset) — chartValue() has nothing to match against for it, so
// its headline fact is hand-picked here instead. The one place a label
// must be curated rather than derived, and only because no chart exists
// to derive it from.
const CURATED_VALUE_LABEL: Record<string, string> = {
  'kestrel-holdings': 'NordBond float accumulated',
};

const STRIP_COUNT = 3;
const CARDS_PER_CATEGORY = 12;
// Direct feedback (2026-07-20): the tracked-assets grid shouldn't be
// capped at the 4 real, universe-backed assets — mocked static filler
// (assetDiscoveryMock.ts) rounds every category to 12 cards for demo
// density. Notable movers below stays scoped to real assets only —
// this grid's own filter/browse job is separate from that strip's
// "what genuinely moved" job, so mixing fictional deltas into the
// ranking would dilute what it actually reports.
const gridAssets = getMockFilledAssets(marketAssets, CARDS_PER_CATEGORY);

function formatDelta(deltaRecent: number): string {
  const sign = deltaRecent > 0 ? '+' : '';
  return `${sign}${deltaRecent.toFixed(2)}pp since prior reading`;
}

// Surfaces a chart-backed entity's own authored attribute verbatim rather
// than reformatting the raw chart number — matched by parsed VALUE against
// the chart's own latest point, not by label text (a label-based match
// silently missed South Bow's own attributes during Phase 16; matching the
// invariant — the number itself — instead of whatever label happened to be
// unique generalizes to any entity's chart without per-entity curation).
// No match (or no chart at all) is an honest '—', never a fabricated figure.
function parseLeadingNumber(value: string | number): number | undefined {
  if (typeof value === 'number') return value;
  // Extracts the numeric substring wherever it falls, not just a leading
  // position — authored values carry unit symbols on either side ("$40.34",
  // "5.8%"), and Number.parseFloat only handles the latter.
  const match = value.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function chartValue(detail: EntityDetail | undefined): string {
  if (!detail || detail.primaryLatest === undefined) return '—';
  const latest = detail.primaryLatest;
  const match = detail.attributes.find((attr) => {
    const parsed = parseLeadingNumber(attr.value);
    return parsed !== undefined && Math.abs(parsed - latest) < 0.005;
  });
  return match ? String(match.value) : latest.toFixed(2);
}

// Trending's own value picker: chart-backed entities defer to chartValue
// above; a chartless entity (Kestrel Holdings) falls back to its curated
// label instead of a bare '—', since that fact is real and worth showing
// even without a series behind it.
function trendingValue(detail: EntityDetail): string {
  if (detail.primaryLatest !== undefined) return chartValue(detail);
  const label = CURATED_VALUE_LABEL[detail.id];
  const attr = label ? detail.attributes.find((candidate) => candidate.label === label) : undefined;
  return attr ? String(attr.value) : '—';
}

// Explicit architect ruling (2026-07-25, direct feedback): rows with no
// real chart series get a deterministic MOCK trend glyph — a logged
// exception to this page's usual "never fabricate" rule, made only
// because full visual parity across every strip row was explicitly
// requested over an honest gap. Reuses assetDiscoveryMock.ts's own
// seeded-sine generator, not a second implementation. Anchors: Kestrel
// Holdings' ties to its own real "11%" fact (see CURATED_VALUE_LABEL) so
// the invented trend at least agrees with something true about it;
// Halberg Materials AG (an equity) and Mira Voss (a person, no numeric
// fact at all) have no real number to anchor to, so theirs are arbitrary
// but fixed. A REAL value already shown (Kestrel's "11%") is never
// overwritten by the mock endpoint — only entities with no real value at
// all (Halberg, Mira Voss) get their displayed value from the mock too.
const MOCK_SPARKLINE_ANCHOR: Record<string, number> = {
  'kestrel-holdings': 11,
  'halberg-materials': 24.5,
  'mira-voss': 3.1,
};
const MOCK_VALUE_UNIT: Record<string, '$' | '%'> = {
  'halberg-materials': '$',
};

function withMockFallback(
  entityId: string,
  realValue: string,
  realPoints: { x: string; y: number }[] | undefined,
): { value: string; sparklinePoints?: { x: string; y: number }[] } {
  if (realPoints) return { value: realValue, sparklinePoints: realPoints };
  const anchor = MOCK_SPARKLINE_ANCHOR[entityId];
  if (anchor === undefined) return { value: realValue };
  const points = mockSparkline(anchor, entityId.length);
  const last = points[points.length - 1]?.y ?? anchor;
  const value = realValue !== '—' ? realValue : MOCK_VALUE_UNIT[entityId] === '$' ? `$${last.toFixed(2)}` : `${last.toFixed(1)}%`;
  return { value, sparklinePoints: points };
}

// Page (Phase 14 — Asset discovery view, upgrades Phase 8H's plain
// browsable list; density + unified-template follow-up 2026-07-20;
// Trending re-based from a live citation counter to a session-fixed
// curated list, direct feedback 2026-07-25 — see TRENDING_ENTITY_IDS
// above). Three strips share one row shape (DiscoveryRow,
// EntityDiscoveryStrips.tsx) built here from real data — every row is
// enriched with a sparkline only when that entity actually has a real
// series behind it (marketAssetById first, falling back to
// resolveEntityDetail's own broader chart lookup for entities outside
// the four Solent bonds — Newly Added and Trending both do this now),
// never fabricated for entities that don't have one. A filterable card
// grid follows: the 4 real,
// universe-backed assets plus deterministic mocked filler rounding
// every category to 12 cards (engine/assetDiscoveryMock.ts — fictional,
// no `intent`, never resolves to an investigation, same honesty posture
// as Data Sources' own mock catalog). Every other universe entity keeps
// the original plain list — Watch and, where an investigation intent
// exists, Investigate, plus (Phase 16 revision) a row click that opens
// entity-detail, same "browse first" law as the grid — Astryx's ListItem
// onClick is the "invisible button pattern" (its own docs), so it
// coexists safely with the nested Watch/Investigate IconButtons already
// in endContent, same mechanism ClickableCard already relies on
// elsewhere on this page. Closes a real gap this order's own gate
// surfaced live: Halberg Materials AG and South Bow Corp had no click
// path to their own detail pages at all until this. No Buy/Sell/Trade
// action anywhere on this page, no wallet connect, no price-action
// framing as an invitation to transact: deltas are informational only
// (principle 2, facts register) — that is what distinguishes this page
// from every screenshot in this genre, and is restated here verbatim
// from the order that shipped it. A plain directional indicator
// (EntityAssetGrid's own triangle) is not itself a call to action — no
// CTA sits beside it.
export function EntitiesPage() {
  const watch = useWatchlistStore((state) => state.watch);
  const openEntityDetail = usePageStore((state) => state.openEntityDetail);
  const resolver = useMemo(() => createKeywordResolver(), []);

  const movers: DiscoveryRow[] = useMemo(
    () =>
      rankMovers(marketAssets, STRIP_COUNT).map((asset) => ({
        id: asset.id,
        name: asset.name,
        detail: formatDelta(asset.deltaRecent),
        value: `${asset.yield.toFixed(1)}%`,
        sparklinePoints: asset.sparklinePoints,
        ...(asset.intent !== undefined ? { intent: asset.intent } : {}),
      })),
    [],
  );

  const trending: DiscoveryRow[] = useMemo(() => {
    const rows: DiscoveryRow[] = [];
    for (const id of TRENDING_ENTITY_IDS) {
      const detail = resolveEntityDetail(id);
      if (!detail) continue;
      const { value, sparklinePoints } = withMockFallback(
        id,
        trendingValue(detail),
        detail.primary ? detail.primary.points.slice(-SPARKLINE_WINDOW) : undefined,
      );
      rows.push({
        id: detail.id,
        name: detail.name,
        detail: detail.type,
        value,
        ...(sparklinePoints ? { sparklinePoints } : {}),
        ...(detail.intent !== undefined ? { intent: detail.intent } : {}),
      });
    }
    return rows;
  }, []);

  const newlyAdded: DiscoveryRow[] = useMemo(
    () =>
      getNewlyAdded(STRIP_COUNT).map((entity) => {
        const intent = intentById.get(entity.id);
        const asset = marketAssetById.get(entity.id);
        if (asset) {
          return {
            id: entity.id,
            name: entity.name,
            detail: entity.type,
            value: `${asset.yield.toFixed(1)}%`,
            sparklinePoints: asset.sparklinePoints,
            ...(intent !== undefined ? { intent } : {}),
          };
        }
        // Not one of the four Solent bonds marketAssetById covers — check
        // resolveEntityDetail's own (broader) chart lookup before giving
        // up, so an entity like South Bow Corp (a real price series, just
        // under a different key pattern) still gets its sparkline here.
        const detail = resolveEntityDetail(entity.id);
        const { value, sparklinePoints } = withMockFallback(
          entity.id,
          chartValue(detail),
          detail?.primary ? detail.primary.points.slice(-SPARKLINE_WINDOW) : undefined,
        );
        return {
          id: entity.id,
          name: entity.name,
          detail: entity.type,
          value,
          ...(sparklinePoints ? { sparklinePoints } : {}),
          ...(intent !== undefined ? { intent } : {}),
        };
      }),
    [],
  );

  return (
    <PageShell title="Discover">
      <div style={{ display: 'grid', gap: 'var(--space-32)' }}>
        <EntityDiscoveryStrips
          movers={movers}
          trending={trending}
          newlyAdded={newlyAdded}
          onInvestigate={(intent) => void submitQuery(intent, resolver)}
        />

        <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
          <Text type="label">Discover Assets</Text>
          <EntityAssetGrid
            assets={gridAssets}
            onWatch={(id, name) => watch(id, name, 'manual')}
            onOpenDetail={openEntityDetail}
          />
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
          <Text type="label">Other tracked entities</Text>
          <List hasDividers density="compact">
            {otherEntities.map(({ entity, intent }) => (
              <ListItem
                key={entity.id}
                label={entity.name}
                description={entity.type}
                onClick={() => openEntityDetail(entity.id)}
                endContent={
                  <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <IconButton
                      label={`Watch ${entity.name}`}
                      tooltip="Add to watchlist"
                      icon={<Icon icon="checkDouble" size="sm" />}
                      variant="ghost"
                      size="sm"
                      onClick={() => watch(entity.id, entity.name, 'manual')}
                    />
                    {intent && (
                      <IconButton
                        label={`Investigate ${entity.name}`}
                        tooltip="Investigate"
                        icon={<Icon icon="externalLink" size="sm" />}
                        variant="ghost"
                        size="sm"
                        onClick={() => void submitQuery(intent, resolver)}
                      />
                    )}
                  </div>
                }
              />
            ))}
          </List>
        </div>
      </div>
    </PageShell>
  );
}
