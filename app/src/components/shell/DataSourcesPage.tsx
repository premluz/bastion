import { useMemo, useState } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Text } from '@astryxdesign/core/Text';
import { Badge } from '@astryxdesign/core/Badge';
import sourcesJson from '../../../universe/sources.json';
import catalogJson from '../../../universe/dataSourceCatalog.json';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useDataSourceConnectionStore } from '../../engine/stores/dataSourceConnectionStore';
import { ConnectSourceDialog, type CatalogEntry } from './ConnectSourceDialog';
import { PageShell } from './PageShell';
import { PageSection } from './PageSection';

interface UniverseSourceRecord {
  name: string;
  description: string;
  status: string;
  lastSync: string;
}

const sources = Object.entries(sourcesJson as Record<string, UniverseSourceRecord>);
const catalog = Object.values(catalogJson as Record<string, CatalogEntry>);

// Page (Phase 8H WO-2, upgrades WO-1's rehomed content). Three parts:
// the seven connected sources (now with status/last-sync alongside the
// existing live citation counter — status is plain text for the common
// "Active" case and a Badge only for the exception, per Badge's own
// "don't badge every healthy row" guidance), a public catalog of
// fictional feeds authored in universe/dataSourceCatalog.json, and a
// mock connect flow (ConnectSourceDialog) — an enterprise-integration
// design surface, UI-complete, wired to nothing real. Confirmed
// connections are session-scoped only (dataSourceConnectionStore, no
// persistence) and move into their own section, never mixed with the
// seven real connected sources.
export function DataSourcesPage() {
  const turns = useSessionStore((state) => state.turns);
  const connectedCatalogIds = useDataSourceConnectionStore((state) => state.connectedCatalogIds);
  const connect = useDataSourceConnectionStore((state) => state.connect);
  const [selectedEntry, setSelectedEntry] = useState<CatalogEntry | null>(null);

  const citationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const turn of turns) {
      if (turn.status !== 'resolved') continue;
      const citedInTurn = new Set<string>();
      for (const step of turn.trail) {
        for (const source of step.sources ?? []) citedInTurn.add(source.name);
      }
      for (const name of citedInTurn) counts[name] = (counts[name] ?? 0) + 1;
    }
    return counts;
  }, [turns]);

  const availableCatalog = catalog.filter((entry) => !connectedCatalogIds[entry.id]);
  const connectedThisSession = catalog.filter((entry) => connectedCatalogIds[entry.id]);

  return (
    <PageShell title="Data Sources">
      <PageSection>
        <List header="Connected" hasDividers density="compact">
          {sources.map(([key, source]) => {
            const count = citationCounts[key] ?? 0;
            return (
              <ListItem
                key={key}
                label={source.name}
                description={source.description}
                endContent={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                    {source.status !== 'Active' && <Badge variant="warning" label={source.status} />}
                    <Text type="supporting" hasTabularNumbers>
                      {source.lastSync} · {count === 0 ? 'Not yet cited' : `Cited in ${count}`}
                    </Text>
                  </div>
                }
              />
            );
          })}
        </List>
      </PageSection>

      {connectedThisSession.length > 0 && (
        <PageSection>
          <List header="Connected this session" hasDividers density="compact">
            {connectedThisSession.map((entry) => (
              <ListItem
                key={entry.id}
                label={entry.name}
                description={entry.description}
                endContent={<Badge variant="info" label="Preview" />}
              />
            ))}
          </List>
        </PageSection>
      )}

      <PageSection>
        <div style={{ display: 'grid', gap: 'var(--space-8)' }}>
          <Text type="supporting" color="secondary">
            Public catalog — a design preview of an integration flow, wired to nothing real; nothing
            connected here reaches a live feed, and nothing persists after a session reset.
          </Text>
          {availableCatalog.length === 0 ? (
            <EmptyState title="Nothing left to preview" description="Every catalog entry is connected this session." />
          ) : (
            <List hasDividers density="compact">
              {availableCatalog.map((entry) => (
                // Row is the click target, same reasoning as Watchlist's
                // Investigate rows — one action per row, promoted to the
                // row itself rather than duplicated as a nested button
                // (Astryx's ListItem docs warn against nesting a second
                // interactive element for the same action).
                <ListItem
                  key={entry.id}
                  label={entry.name}
                  description={`${entry.category} · ${entry.description}`}
                  endContent={
                    <Text type="supporting" color="secondary">
                      Connect
                    </Text>
                  }
                  onClick={() => setSelectedEntry(entry)}
                />
              ))}
            </List>
          )}
        </div>
      </PageSection>

      <ConnectSourceDialog entry={selectedEntry} onOpenChange={(isOpen) => !isOpen && setSelectedEntry(null)} onConfirm={connect} />
    </PageShell>
  );
}
