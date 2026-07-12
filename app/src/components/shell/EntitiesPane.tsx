import { useMemo } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Icon } from '@astryxdesign/core/Icon';
import entitiesJson from '../../../universe/entities.json';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { submitQuery } from '../../engine/submitQuery';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { IndexPaneShell } from './IndexPaneShell';

interface UniverseEntityRecord {
  entity: { id: string; name: string; type: string };
  intent?: string;
}

const entities = Object.values(entitiesJson as Record<string, UniverseEntityRecord>);

// Index pane (Phase 8G WO-2): every universe entity, browsable
// independent of any investigation. Stable per the routing law — a row's
// actions start a *new* investigation in the artifact pane or add to the
// watchlist; this pane's own list never changes in response to either.
// Watch and Investigate are both real, wired actions (never dead
// controls) — Investigate only renders for entities that actually carry
// an investigation intent (aldergate-estates, nordbond-2029 today; the
// rest stay watchable but not click-to-investigate, same asymmetry
// Phase 8F's EntityLink already established for Helios).
export function EntitiesPane({ width }: { width: number }) {
  const watch = useWatchlistStore((state) => state.watch);
  const resolver = useMemo(() => createKeywordResolver(), []);

  return (
    <IndexPaneShell paneKind="entities" title="Entities" width={width}>
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
    </IndexPaneShell>
  );
}
