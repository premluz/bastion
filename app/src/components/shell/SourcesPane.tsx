import { useMemo } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Text } from '@astryxdesign/core/Text';
import sourcesJson from '../../../universe/sources.json';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { IndexPaneShell } from './IndexPaneShell';

interface UniverseSourceRecord {
  name: string;
  description: string;
}

const sources = Object.entries(sourcesJson as Record<string, UniverseSourceRecord>);

// Index pane (Phase 8G WO-2): every universe source with a live "cited
// in N investigations this session" counter — computed from real turns,
// zero if none, no seeding (an honest counter is the whole point: it
// tells a viewer which sources the agent has actually relied on this
// session, not a static index of what's plugged in). Counts distinct
// *turns* that cite a source at least once, not raw per-step mentions —
// "cited in 3 investigations" means 3 separate questions drew on it, not
// that one trail mentioned it 3 times.
//
// Keyed by `source.name`, not `source.ref`: a ThinkingStepSource's `ref`
// is a scene-local citation slug (e.g. "aldergate-holders" — which
// record within the source was pulled), while `name` is the source's own
// identity ("PortfolioAtlas") and is what actually matches a
// universe/sources.json key. Found live running this pane's own
// verification script, not assumed — the first version keyed on `ref`
// and every count silently stayed zero.
export function SourcesPane({ width }: { width: number }) {
  const turns = useSessionStore((state) => state.turns);

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

  return (
    <IndexPaneShell paneKind="sources" title="Sources" width={width}>
      {sources.length === 0 ? (
        <EmptyState title="No sources" description="The universe has no sources registered yet." />
      ) : (
        <List hasDividers density="compact">
          {sources.map(([key, source]) => {
            const count = citationCounts[key] ?? 0;
            return (
              <ListItem
                key={key}
                label={source.name}
                description={source.description}
                endContent={
                  <Text type="supporting" hasTabularNumbers>
                    {count === 0 ? 'Not yet cited' : `Cited in ${count} investigation${count === 1 ? '' : 's'}`}
                  </Text>
                }
              />
            );
          })}
        </List>
      )}
    </IndexPaneShell>
  );
}
