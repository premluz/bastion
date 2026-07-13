import { useEffect, useMemo, useRef, useState } from 'react';
import { List, ListItem } from '@astryxdesign/core/List';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { TextInput } from '@astryxdesign/core/TextInput';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { StatusDot, type StatusDotVariant } from '@astryxdesign/core/StatusDot';
import { useSessionStore, type Turn } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePageStore } from '../../engine/stores/pageStore';
import { PageShell } from './PageShell';

const MODULE_ORDER = ['discover', 'research', 'investigate', 'monitor', 'portfolio'] as const;
type Module = (typeof MODULE_ORDER)[number];
const MODULE_LABEL: Record<Module, string> = {
  discover: 'Discover',
  research: 'Research',
  investigate: 'Investigate',
  monitor: 'Monitor',
  portfolio: 'Portfolio',
};

function isModule(value: string): value is Module {
  return (MODULE_ORDER as readonly string[]).includes(value);
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function statusDot(turn: Turn, module: string | undefined): { variant: StatusDotVariant; label: string } {
  if (turn.status === 'unresolved') return { variant: 'neutral', label: 'No match' };
  // An interrupted turn only reaches this helper via the flat view, which
  // iterates every turn unconditionally (module view only ever pushes
  // artifactRef-bearing rows) — without this branch it fell through to
  // "Answered" while sitting isDisabled, a real, visible contradiction.
  if (turn.status === 'interrupted') return { variant: 'neutral', label: 'Interrupted' };
  return module === 'monitor' ? { variant: 'error', label: 'Alert' } : { variant: 'success', label: 'Answered' };
}

// Page (Phase 8H) — absorbs Phase 8C's Sidebar module-grouped list and
// Phase 8G's HistoryPane flat list verbatim, as two views of the same
// turn data rather than two separate nav destinations. The notification
// bell's "focus Monitor" jumps here in module view, scrolled to the
// Monitor section.
export function InvestigationsPage() {
  const [viewMode, setViewMode] = useState<'module' | 'flat'>('module');
  const [query, setQuery] = useState('');
  const turns = useSessionStore((state) => state.turns);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const openArtifactId = useArtifactStore((state) => state.openArtifactId);
  const setOpenArtifact = useArtifactStore((state) => state.setOpenArtifact);
  const setPage = usePageStore((state) => state.setPage);
  const focusModule = usePageStore((state) => state.focusModule);
  const clearFocusModule = usePageStore((state) => state.clearFocusModule);
  const monitorRef = useRef<HTMLDivElement>(null);

  // A row is a link to the investigation, not just its artifact — opening
  // one must land back on Home (where the investigation's own turn and
  // trail live), not just swap the still-open stack's content while
  // leaving the user on this page. Same fix as Sidebar's Recent rows and
  // Market Pulse's own cards; one small helper so the two views below
  // don't each reimplement the pairing.
  function openInvestigation(artifactRef: string) {
    setPage('home');
    setOpenArtifact(artifactRef);
  }

  const filtered = useMemo(
    () => turns.filter((turn) => turn.utterance.toLowerCase().includes(query.trim().toLowerCase())),
    [turns, query],
  );

  const rowsByModule = useMemo(() => {
    const grouped: Record<Module, { turn: Turn; artifactRef: string }[]> = {
      discover: [],
      research: [],
      investigate: [],
      monitor: [],
      portfolio: [],
    };
    const unresolved: typeof filtered = [];
    for (const turn of filtered) {
      if (turn.status === 'unresolved') {
        unresolved.push(turn);
        continue;
      }
      const artifactRef = turn.artifactRef;
      const module = artifactRef ? artifacts[artifactRef]?.module : undefined;
      if (artifactRef && module && isModule(module)) grouped[module].push({ turn, artifactRef });
    }
    return { grouped, unresolved };
  }, [filtered, artifacts]);

  const flatRows = useMemo(() => [...filtered].reverse(), [filtered]);

  // "Focus Monitor" (notification bell) always means module view, scrolled
  // to the Monitor section — one effect switches the mode, a second scrolls
  // once that section actually exists in the DOM, then clears the one-shot.
  useEffect(() => {
    if (focusModule) setViewMode('module');
  }, [focusModule]);

  useEffect(() => {
    if (focusModule === 'monitor' && monitorRef.current) {
      monitorRef.current.scrollIntoView({ block: 'start' });
      clearFocusModule();
    }
  }, [focusModule, clearFocusModule, rowsByModule.grouped.monitor]);

  return (
    <PageShell title="Investigations">
      <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
        <SegmentedControl label="View" value={viewMode} onChange={(value) => setViewMode(value as 'module' | 'flat')}>
          <SegmentedControlItem value="module" label="By module" />
          <SegmentedControlItem value="flat" label="All" />
        </SegmentedControl>
        <div style={{ maxWidth: 320, flex: 1 }}>
          <TextInput
            label="Search investigations"
            isLabelHidden
            value={query}
            onChange={setQuery}
            placeholder="Search investigations…"
            size="sm"
          />
        </div>
      </div>

      {turns.length === 0 ? (
        <EmptyState title="No investigations yet" description="Ask a question from Home to start one." />
      ) : viewMode === 'module' ? (
        <div style={{ display: 'grid', gap: 'var(--space-24)' }}>
          {MODULE_ORDER.map((module) => {
            const rows = rowsByModule.grouped[module];
            if (rows.length === 0) return null;
            return (
              <div key={module} ref={module === 'monitor' ? monitorRef : undefined}>
                <List header={MODULE_LABEL[module]} hasDividers density="compact">
                  {rows.map(({ turn, artifactRef }) => {
                    const dot = statusDot(turn, module);
                    return (
                      <ListItem
                        key={turn.id}
                        label={truncate(turn.utterance, 60)}
                        description={formatTimestamp(turn.timestamp)}
                        isSelected={artifactRef === openArtifactId}
                        onClick={() => openInvestigation(artifactRef)}
                        endContent={<StatusDot variant={dot.variant} label={dot.label} />}
                      />
                    );
                  })}
                </List>
              </div>
            );
          })}
          {rowsByModule.unresolved.length > 0 && (
            <List header="Unresolved" hasDividers density="compact">
              {rowsByModule.unresolved.map((turn) => (
                <ListItem
                  key={turn.id}
                  label={truncate(turn.utterance, 60)}
                  description={formatTimestamp(turn.timestamp)}
                  isDisabled
                  endContent={<StatusDot variant="neutral" label="No match" />}
                />
              ))}
            </List>
          )}
        </div>
      ) : (
        <List hasDividers density="compact">
          {flatRows.map((turn) => {
            const module = turn.artifactRef ? artifacts[turn.artifactRef]?.module : undefined;
            const dot = statusDot(turn, module);
            const artifactRef = turn.artifactRef;
            return (
              <ListItem
                key={turn.id}
                label={truncate(turn.utterance, 60)}
                description={formatTimestamp(turn.timestamp)}
                isSelected={!!artifactRef && artifactRef === openArtifactId}
                isDisabled={!artifactRef}
                endContent={<StatusDot variant={dot.variant} label={dot.label} />}
                {...(artifactRef ? { onClick: () => openInvestigation(artifactRef) } : {})}
              />
            );
          })}
        </List>
      )}
    </PageShell>
  );
}
