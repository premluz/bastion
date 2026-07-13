import { useMemo } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import entitiesJson from '../../../universe/entities.json';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { submitQuery } from '../../engine/submitQuery';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { PageShell } from './PageShell';

interface UniverseEntityRecord {
  entity: { id: string; name: string; type: string };
  intent?: string;
}

const entities = Object.values(entitiesJson as Record<string, UniverseEntityRecord>);

// Page (Phase 8H, rehomed verbatim from Phase 8G's EntitiesPane — content
// unchanged, only its chrome: PageShell instead of a resizable side pane).
// Every universe entity, browsable independent of any investigation.
// Watch and Investigate are both real, wired actions — Investigate only
// renders for entities that carry an investigation intent (aldergate-
// estates, nordbond-2029 today; the rest stay watchable but not
// click-to-investigate). Per the routing law, this page never renders a
// scene itself — Investigate always lands in the artifact stack.
export function EntitiesPage() {
  const watch = useWatchlistStore((state) => state.watch);
  const resolver = useMemo(() => createKeywordResolver(), []);

  return (
    <PageShell title="Entities">
      {entities.length === 0 ? (
        <EmptyState title="No entities" description="The universe has no entities to browse yet." />
      ) : (
        <List hasDividers density="compact">
          {entities.map(({ entity, intent }) => (
            <ListItem
              key={entity.id}
              label={entity.name}
              description={entity.type}
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
      )}
    </PageShell>
  );
}
