import { useMemo } from 'react';
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList';
import { List } from '@astryxdesign/core/List';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import { Text } from '@astryxdesign/core/Text';
import { EmptyState } from '@astryxdesign/core/EmptyState';
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
import { submitQuery } from '../../engine/submitQuery';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { PageShell } from './PageShell';
import { ThreadRow } from './ThreadRow';
import { RelatedEntitiesStrip } from './RelatedEntitiesStrip';
import { EntityTrendStats } from './EntityTrendStats';

const resolver = createKeywordResolver();
const RELATED_COUNT = 3;

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

  const intent = entity.intent;

  return (
    <PageShell
      title={entity.name}
      headerActions={
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
    >
      <div style={{ display: 'grid', gap: 'var(--space-24)' }}>
        <Text type="supporting" color="secondary">
          {entity.type}
        </Text>

        <EntityTrendStats entity={entity} />

        <Panel title="About">
          {entity.attributes.length === 0 ? (
            <Text type="supporting" color="secondary">
              No further profile authored for this entry.
            </Text>
          ) : (
            <MetadataList columns="multi" orientation="horizontal">
              {entity.attributes.map((attribute) => (
                <MetadataListItem key={attribute.label} label={attribute.label}>
                  <Text type="body" hasTabularNumbers>
                    {attribute.value}
                  </Text>
                </MetadataListItem>
              ))}
            </MetadataList>
          )}
        </Panel>

        {entity.news && (
          <Panel title="Coverage">
            <NewsFeed data={entity.news} />
          </Panel>
        )}

        <RelatedEntitiesStrip entities={related} onOpen={openEntityDetail} />

        <div style={{ display: 'grid', gap: 'var(--space-12)' }}>
          <Text type="label">Investigations</Text>
          {relatedThreads.length === 0 ? (
            <EmptyState title="No investigations yet" description="No investigation this session has referenced this entity." />
          ) : (
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
          )}
        </div>
      </div>
    </PageShell>
  );
}
