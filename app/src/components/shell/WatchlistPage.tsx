import { useMemo } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Icon } from '@astryxdesign/core/Icon';
import entitiesJson from '../../../universe/entities.json';
import { useWatchlistStore } from '../../engine/stores/watchlistStore';
import { submitQuery } from '../../engine/submitQuery';
import { createKeywordResolver } from '../../engine/resolver/keywordResolver';
import { PageShell } from './PageShell';
import { PageSection } from './PageSection';
import animatedItemStyles from './AnimatedListItem.module.css';

interface UniverseEntityRecord {
  intent?: string;
}

const intentById = new Map(
  Object.entries(entitiesJson as Record<string, UniverseEntityRecord>).map(([id, record]) => [id, record.intent]),
);

const SOURCE_LABEL = { seeded: 'Seeded', manual: 'Added', alert: 'From alert' } as const;

// Page (Phase 8H, rehomed verbatim from Phase 8G's WatchlistPane).
// Seeded entities (universe/watchlist.json, fictional statuses authored
// there) plus anything watched this session — from an entity-header, the
// Entities page, or automatically once a Monitor-module turn lands
// (presentScene.ts). Session-scoped: nothing here survives a reset,
// stated in the empty state's own copy, not a modal.
export function WatchlistPage() {
  const items = useWatchlistStore((state) => state.items);
  const resolver = useMemo(() => createKeywordResolver(), []);
  const rows = useMemo(
    () => Object.values(items).sort((a, b) => b.watchedAt.localeCompare(a.watchedAt)),
    [items],
  );

  return (
    <PageShell title="Watchlist">
      {rows.length === 0 ? (
        <EmptyState
          title="Nothing watched yet"
          description="Watch an entity from its header or the Entities page to track it here — session-scoped, nothing persists after a reset."
        />
      ) : (
        <PageSection>
          <List hasDividers density="compact">
          {rows.map((item, index) => {
            const intent = intentById.get(item.entityId);
            // The row itself is the click target when there's somewhere to
            // go — Astryx's ListItem only gains hover/press styling once
            // it's genuinely interactive (onClick/href), and its own docs
            // warn against nesting a second interactive element for the
            // same action, so this replaces the old inner IconButton
            // rather than sitting alongside it. A row with no intent has
            // nothing to click into and correctly stays plain — no hover
            // implying an action that isn't there.
            //
            // Animation is applied directly to ListItem's own <li> (via
            // className/style, not an AnimatedListItem wrapper div): List's
            // hasDividers styling keys off ':last-child' on the <li> itself
            // (ListItem.tsx's withDivider style) — wrapping each row in a
            // div would make every <li> the sole/last child of its own
            // wrapper, matching ':last-child' every time and silently
            // killing every divider, on top of producing invalid
            // <ul><div><li> nesting.
            return (
              <ListItem
                key={item.entityId}
                className={animatedItemStyles.animatedItem}
                style={{ '--item-index': index } as React.CSSProperties}
                label={item.label}
                description={`${item.status} · ${SOURCE_LABEL[item.source]}`}
                endContent={intent ? <Icon icon="externalLink" size="sm" /> : undefined}
                {...(intent ? { onClick: () => void submitQuery(intent, resolver) } : {})}
              />
            );
          })}
          </List>
        </PageSection>
      )}
    </PageShell>
  );
}
