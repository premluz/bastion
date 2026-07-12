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
  intent?: string;
}

const intentById = new Map(
  Object.entries(entitiesJson as Record<string, UniverseEntityRecord>).map(([id, record]) => [id, record.intent]),
);

const SOURCE_LABEL = { seeded: 'Seeded', manual: 'Added', alert: 'From alert' } as const;

// Index pane (Phase 8G WO-2): seeded entities (universe/watchlist.json,
// fictional statuses authored there — logged as extrapolation) plus
// anything watched this session — from an entity-header's Watch action,
// an Entities-pane row, or automatically once a Monitor-module turn
// lands (presentScene.ts). Session-scoped: nothing here survives a
// session reset, stated in the empty state's own copy rather than a
// modal, same pattern Sidebar's "New investigation" already established.
// Newest-watched first — watchedAt is real data, not decoration.
export function WatchlistPane({ width }: { width: number }) {
  const items = useWatchlistStore((state) => state.items);
  const resolver = useMemo(() => createKeywordResolver(), []);
  const rows = useMemo(
    () => Object.values(items).sort((a, b) => b.watchedAt.localeCompare(a.watchedAt)),
    [items],
  );

  return (
    <IndexPaneShell paneKind="watchlist" title="Watchlist" width={width}>
      {rows.length === 0 ? (
        <EmptyState
          title="Nothing watched yet"
          description="Watch an entity from its header or the Entities pane to track it here — session-scoped, nothing persists after a reset."
        />
      ) : (
        <List hasDividers density="compact">
          {rows.map((item) => {
            const intent = intentById.get(item.entityId);
            return (
              <ListItem
                key={item.entityId}
                label={item.label}
                description={`${item.status} · ${SOURCE_LABEL[item.source]}`}
                endContent={
                  intent ? (
                    <IconButton
                      label={`Investigate ${item.label}`}
                      tooltip="Investigate"
                      icon={<Icon icon="externalLink" size="sm" />}
                      variant="ghost"
                      size="sm"
                      onClick={() => void submitQuery(intent, resolver)}
                    />
                  ) : null
                }
              />
            );
          })}
        </List>
      )}
    </IndexPaneShell>
  );
}
