import { useMemo } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
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
import { DiscoverAssetsSection } from './DiscoverAssetsSection';
import { PageSection } from './PageSection';

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
// load instead. Category-isolated per node-vocabulary rule (2026-07-30):
// Trending is a momentum-framed surface, scoped to crypto/stocks only —
// excludes fixed-income/real-estate/credit-funds. Three diverse equities
// (south-bow-corp, meridian-logistics, kynthia-renewables) curated for
// narrative variety and to differentiate from Notable Movers' top-3 and
// Newly Added's rotation — each strip has distinct entities visible.
const TRENDING_ENTITY_IDS = ['south-bow-corp', 'meridian-logistics', 'kynthia-renewables'] as const;

// Kestrel Holdings carries no chart series (it's a counterparty, not a
// priced asset) — chartValue() has nothing to match against for it, so
// its headline fact is hand-picked here instead. The one place a label
// must be curated rather than derived, and only because no chart exists
// to derive it from.
const CURATED_VALUE_LABEL: Record<string, string> = {
  'kestrel-holdings': 'NordBond float accumulated',
};

// Trend indicator gate ("mostly crypto and equity," direct feedback
// 2026-08-01) — mirrors movers' own filter below. getMarketAssets() never
// populates delta24hPercent/price for real universe entities (only
// yield/deltaRecent, computed uniformly regardless of category — a
// pre-existing data gap, not something this pass fixes), so deltaRecent
// (already correct, already used the same way by EntityAssetTableCells.
// tsx's own default-category delta cell) is the trend source, unit "pp".
function isMomentumCategory(category: string | undefined): boolean {
  return category === 'crypto' || category === 'asset' || category === 'equity' || category === 'commodities';
}

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
// requested over an honest gap. Generalized (direct feedback, 2026-08-01):
// every strip row needs a sparkline, not just the three originally
// curated — equity/commodities/real-estate entities with no real series
// were rendering blank. Reuses assetDiscoveryMock.ts's own seeded-sine
// generator, not a second implementation. Anchor priority: (1) an
// explicitly curated value below, kept for the entities it was chosen
// for (Kestrel's tie to its own real "11%" fact; Halberg/Mira Voss, which
// have no numeric fact at all, arbitrary but fixed); (2) the real value
// already being displayed, parsed back to a number, so the fabricated
// trend at least agrees with a fact already shown instead of inventing an
// unrelated one; (3) a flat generic default only when neither exists. A
// REAL value already shown is never overwritten by the mock endpoint —
// only entities with no real value at all get their displayed value from
// the mock too.
const MOCK_SPARKLINE_ANCHOR: Record<string, number> = {
  'kestrel-holdings': 11,
  'halberg-materials': 24.5,
  'mira-voss': 3.1,
};
const MOCK_VALUE_UNIT: Record<string, '$' | '%'> = {
  'halberg-materials': '$',
};
const DEFAULT_MOCK_ANCHOR = 50;

function withMockFallback(
  entityId: string,
  realValue: string,
  realPoints: { x: string; y: number }[] | undefined,
): { value: string; sparklinePoints?: { x: string; y: number }[] } {
  if (realPoints) return { value: realValue, sparklinePoints: realPoints };
  const anchor = MOCK_SPARKLINE_ANCHOR[entityId] ?? parseLeadingNumber(realValue) ?? DEFAULT_MOCK_ANCHOR;
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

  // Notable Movers scoped to crypto/stocks/commodities per category-isolation rule
  // (node-vocabulary.md): momentum-framed surfaces exclude fixed-income/RE/credit-funds
  const movers: DiscoveryRow[] = useMemo(
    () =>
      rankMovers(
        marketAssets.filter((a) => a.category === 'crypto' || a.category === 'asset' || a.category === 'equity' || a.category === 'commodities'),
        STRIP_COUNT,
      ).map((asset) => {
        // getMarketAssets() only has a real chart for bond/yield-fund
        // entities (getYieldPoints's dataset key is yield-specific) — every
        // crypto/asset/commodities row lands here with sparklinePoints: []
        // (truthy, but empty — Sparkline renders blank). withMockFallback
        // (below) is the same mechanism Trending already uses to guarantee
        // a glyph either way.
        const priceValue = asset.price ? `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
        const { value, sparklinePoints } = withMockFallback(asset.id, priceValue, asset.sparklinePoints.length > 0 ? asset.sparklinePoints : undefined);
        return {
          id: asset.id,
          name: asset.name,
          // Descriptor under the name is the entity's type (matching
          // every other strip's row — "Tokenized Covered Bond" etc.), not
          // a redundant percentage: TrendDelta already carries the delta
          // in endContent, and the category Badge (now dropped from
          // EntityDiscoveryStrips.tsx) was the same fact shown twice.
          detail: asset.type,
          value,
          ...(sparklinePoints ? { sparklinePoints } : {}),
          deltaPercent: asset.deltaRecent,
          ...(asset.intent !== undefined ? { intent: asset.intent } : {}),
        };
      }),
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
        ...(detail.deltaRecent !== undefined && isMomentumCategory(detail.category) ? { deltaPercent: detail.deltaRecent } : {}),
      });
    }
    return rows;
  }, []);

  // Newly Added: mixed-category allowed (a newly issued bond is as legitimately
  // "new" as a newly listed crypto token). Category tag required on every card
  // for disambiguation. No filtering — recency is neutral observation, not
  // momentum claim (unlike Movers/Trending which stay crypto/stocks-only).
  const newlyAdded: DiscoveryRow[] = useMemo(
    () =>
      getNewlyAdded(STRIP_COUNT).map((entity) => {
        const intent = intentById.get(entity.id);
        const asset = marketAssetById.get(entity.id);
        if (asset) {
          // Same empty-sparklinePoints gap as movers above — route through
          // withMockFallback so every category gets a glyph.
          const assetValue = asset.price ? `$${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${asset.yield?.toFixed(1) ?? '—'}%`;
          const { value, sparklinePoints } = withMockFallback(entity.id, assetValue, asset.sparklinePoints.length > 0 ? asset.sparklinePoints : undefined);
          return {
            id: entity.id,
            name: entity.name,
            detail: entity.type,
            value,
            ...(sparklinePoints ? { sparklinePoints } : {}),
            ...(isMomentumCategory(asset.category) ? { deltaPercent: asset.deltaRecent } : {}),
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
          ...(detail?.deltaRecent !== undefined && isMomentumCategory(detail?.category) ? { deltaPercent: detail.deltaRecent } : {}),
        };
      }),
    [],
  );

  return (
    <PageShell title="Discover">
      <EntityDiscoveryStrips
        movers={movers}
        trending={trending}
        newlyAdded={newlyAdded}
        onInvestigate={(intent) => void submitQuery(intent, resolver)}
      />

      <DiscoverAssetsSection
        assets={gridAssets}
        onWatch={(id, name) => watch(id, name, 'manual')}
        onOpenDetail={openEntityDetail}
      />

      <PageSection title="Other tracked entities">
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
      </PageSection>
    </PageShell>
  );
}
