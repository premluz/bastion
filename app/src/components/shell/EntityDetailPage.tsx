import { useMemo } from 'react';
import { List } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Panel } from '../nodes/Panel';
import { NewsFeed } from '../nodes/NewsFeed';
import { resolveEntityDetail, findRelatedEntities } from '../../engine/entityDetail';
import { sceneReferencesEntity } from '../../engine/assetDiscovery';
import { buildThreads } from '../../engine/threads';
import { reopenThread } from '../../engine/openThread';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { usePageStore } from '../../engine/stores/pageStore';
import { PageShell } from './PageShell';
import { ThreadRow } from './ThreadRow';
import { RelatedEntitiesStrip } from './RelatedEntitiesStrip';
import { EntityTrend } from './EntityTrend';
import { EntityStatistics } from './EntityStatistics';
import { EntityAbout } from './EntityAbout';
import { AnimatedListItem } from './AnimatedListItem';
import type { ThreadSummary } from '../../engine/threads';

const RELATED_COUNT = 3;

// Coverage summary (2026-07-25 order) — a template-generated sentence,
// not live LLM generation, same discipline as scene-summary/
// recommendation: real data (the same ThreadSummary[] the Investigations
// list below already renders — one computation, not a second query),
// scripted synthesis. Chosen rule, the simplest one that's still
// correct: concatenate each thread's own title with its date, joined by
// connectives — no attempt at deeper NLG (e.g. inferring a theme across
// threads), since the titles themselves already carry that meaning.
function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function formatShortDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildCoverageSummary(threads: ThreadSummary[]): string {
  const parts = threads.map((thread) => `${thread.title} (${formatShortDate(thread.timestamp)})`);
  const count = threads.length === 1 ? 'once' : threads.length === 2 ? 'twice' : `${threads.length} times`;
  return `Investigated ${count} this session: ${joinWithAnd(parts)}.`;
}

// Page (Phase 16, revised scope 2026-07-23) — reached by clicking any
// Discover grid card, real or mocked filler (EntityAssetGrid.tsx), or a
// related-entity link: browse first, investigate second. No SceneRenderer
// anywhere — chart/Statistics/About/News are built from the SAME facts a
// scene would bind (universe attributes, the yield/price series, authored
// news coverage), authored here as plain props exactly like DashboardPage's
// own static pages (Phase 13's rule-1 shell exception: registry nodes
// imported directly by shell code, flagged each time it happens, same as
// here). No trade/buy-sell surface anywhere on this page — order's
// explicit exclusion; this is the SeekingAlpha register (News/Stats/
// Compare), not the Kraken one.
export function EntityDetailPage() {
  const selectedEntityId = usePageStore((state) => state.selectedEntityId);
  const setPage = usePageStore((state) => state.setPage);
  const openEntityDetail = usePageStore((state) => state.openEntityDetail);
  const turns = useSessionStore((state) => state.turns);
  const activeThreadId = useSessionStore((state) => state.activeThreadId);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const watch = useWatchlistStore((state) => state.watch);

  const entity = selectedEntityId ? resolveEntityDetail(selectedEntityId) : undefined;

  const relatedThreads = useMemo(() => {
    if (!entity) return [];
    return buildThreads(turns).filter((thread) => thread.turns.some((turn) => turn.sceneId && sceneReferencesEntity(turn.sceneId, entity.id)));
  }, [turns, entity]);

  const related = useMemo(() => (entity ? findRelatedEntities(entity, RELATED_COUNT) : []), [entity]);

  if (!entity) {
    return (
      <PageShell title="Entity">
        <EmptyState title="No entity selected" description="Open an entity from the Discover grid to see its detail page here." />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={entity.name}
      titleEndContent={
        <IconButton
          label={`Watch ${entity.name}`}
          tooltip="Add to watchlist"
          icon={<Icon icon="checkDouble" size="sm" />}
          variant="ghost"
          size="sm"
          onClick={() => watch(entity.id, entity.name, 'manual')}
        />
      }
    >
      {/* <AnimatedListItem index={0}>
        <Text type="supporting" color="secondary">
          {entity.type}
        </Text>
      </AnimatedListItem> */}

      <AnimatedListItem index={0}>
        <EntityTrend entity={entity} />
      </AnimatedListItem>

      {/* Statistics + About side by side (direct order, 2026-07-29):
          two flex columns in one row, each shrinkable (minWidth: 0) so
          neither forces the row wider than its container — wraps to
          stacked on a narrow content column rather than overflowing,
          same reasoning as every other flex-row split on this page. */}
      <AnimatedListItem index={1}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-24)' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <EntityStatistics entity={entity} />
          </div>
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <EntityAbout entity={entity} />
          </div>
        </div>
      </AnimatedListItem>

      {entity.news && (
        <AnimatedListItem index={2}>
          <Panel title="Coverage">
            <NewsFeed data={entity.news} />
          </Panel>
        </AnimatedListItem>
      )}

      <AnimatedListItem index={entity.news ? 3 : 2}>
        <RelatedEntitiesStrip entities={related} onOpen={openEntityDetail} />
      </AnimatedListItem>

      <AnimatedListItem index={entity.news ? 4 : 3}>
        <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
          <Text type="label">Investigations</Text>
          {relatedThreads.length === 0 ? (
            <EmptyState title="No investigations yet this session" description="No investigation this session has referenced this entity." />
          ) : (
            <>
              {/* Coverage summary: additive, above the list, never a
                  replacement for it — analysts still want the raw
                  citations (title/date/status) the list below provides. */}
              <Text type="body" style={{ fontFamily: 'var(--face-voice)' }}>
                {buildCoverageSummary(relatedThreads)}
              </Text>
              <List hasDividers density="compact">
                {relatedThreads.map((thread) => {
                  const module = thread.latestTurn.artifactRef ? artifacts[thread.latestTurn.artifactRef]?.module : undefined;
                  return (
                    <ThreadRow
                      key={thread.threadId}
                      thread={thread}
                      module={module}
                      isSelected={activeThreadId === thread.threadId}
                      onClick={() => {
                        setPage('home');
                        reopenThread(thread);
                      }}
                    />
                  );
                })}
              </List>
            </>
          )}
        </div>
      </AnimatedListItem>
    </PageShell>
  );
}
