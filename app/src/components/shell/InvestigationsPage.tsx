import { useEffect, useMemo, useRef, useState } from 'react';
import { List } from '@astryxdesign/core/List';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { TextInput } from '@astryxdesign/core/TextInput';
import { SegmentedControl, SegmentedControlItem } from '@astryxdesign/core/SegmentedControl';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { usePageStore } from '../../engine/stores/pageStore';
import { buildThreads, type ThreadSummary } from '../../engine/threads';
import { reopenThread } from '../../engine/openThread';
import { PageShell } from './PageShell';
import { ThreadRow } from './ThreadRow';

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

// Page (Phase 8H) — absorbs Phase 8C's Sidebar module-grouped list and
// Phase 8G's HistoryPane flat list verbatim, as two views of the same
// data rather than two separate nav destinations. The notification
// bell's "focus Monitor" jumps here in module view, scrolled to the
// Monitor section.
//
// Investigation threading order: both views now group by THREAD
// (buildThreads), not by individual turn — a base query and its refine,
// or an entity-link that rejoined an earlier investigation, collapse
// into one row here too, same as Sidebar's Recent. Every row is clickable
// now (a thread is always a real, viewable transcript, even one whose
// only turn never resolved) — the old isDisabled-for-no-artifact state
// is gone.
export function InvestigationsPage() {
  const [viewMode, setViewMode] = useState<'module' | 'flat'>('module');
  const [query, setQuery] = useState('');
  const turns = useSessionStore((state) => state.turns);
  const activeThreadId = useSessionStore((state) => state.activeThreadId);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const setPage = usePageStore((state) => state.setPage);
  const focusModule = usePageStore((state) => state.focusModule);
  const clearFocusModule = usePageStore((state) => state.clearFocusModule);
  const monitorRef = useRef<HTMLDivElement>(null);

  // A row is a link to the investigation, not just its artifact — opening
  // one must land back on Home. reopenThread (shared with Sidebar) handles
  // which thread/artifact becomes current.
  function openInvestigation(thread: ThreadSummary) {
    setPage('home');
    reopenThread(thread);
  }

  const threads = useMemo(() => buildThreads(turns), [turns]);
  const filtered = useMemo(
    () => threads.filter((thread) => thread.title.toLowerCase().includes(query.trim().toLowerCase())),
    [threads, query],
  );

  const rowsByModule = useMemo(() => {
    const grouped: Record<Module, ThreadSummary[]> = {
      discover: [],
      research: [],
      investigate: [],
      monitor: [],
      portfolio: [],
    };
    // Matches the pre-threading grouping exactly: only a genuinely
    // unresolved latest turn lands in "Unresolved" — a still-thinking
    // thread (resolved, no artifact yet) or an interrupted one stays
    // invisible here, same as before, reachable via Sidebar's Recent or
    // the flat view instead. Broadening "Unresolved" to catch those too
    // would mislabel a live, in-progress investigation as unresolved.
    const unresolved: ThreadSummary[] = [];
    for (const thread of filtered) {
      if (thread.latestTurn.status === 'unresolved') {
        unresolved.push(thread);
        continue;
      }
      const artifactRef = thread.latestTurn.artifactRef;
      const module = artifactRef ? artifacts[artifactRef]?.module : undefined;
      if (artifactRef && module && isModule(module)) grouped[module].push(thread);
    }
    return { grouped, unresolved };
  }, [filtered, artifacts]);

  const flatRows = filtered;

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

      {threads.length === 0 ? (
        <EmptyState title="No investigations yet" description="Ask a question from Home to start one." />
      ) : viewMode === 'module' ? (
        <div style={{ display: 'grid', gap: 'var(--space-24)' }}>
          {MODULE_ORDER.map((module) => {
            const rows = rowsByModule.grouped[module];
            if (rows.length === 0) return null;
            return (
              <div key={module} ref={module === 'monitor' ? monitorRef : undefined}>
                <List header={MODULE_LABEL[module]} hasDividers density="compact">
                  {rows.map((thread) => (
                    <ThreadRow
                      key={thread.threadId}
                      thread={thread}
                      module={module}
                      isSelected={activeThreadId === thread.threadId}
                      onClick={() => openInvestigation(thread)}
                    />
                  ))}
                </List>
              </div>
            );
          })}
          {rowsByModule.unresolved.length > 0 && (
            <List header="Unresolved" hasDividers density="compact">
              {rowsByModule.unresolved.map((thread) => (
                <ThreadRow
                  key={thread.threadId}
                  thread={thread}
                  module={undefined}
                  isSelected={activeThreadId === thread.threadId}
                  onClick={() => openInvestigation(thread)}
                />
              ))}
            </List>
          )}
        </div>
      ) : (
        <List hasDividers density="compact">
          {flatRows.map((thread) => {
            const module = thread.latestTurn.artifactRef ? artifacts[thread.latestTurn.artifactRef]?.module : undefined;
            return (
              <ThreadRow
                key={thread.threadId}
                thread={thread}
                module={module}
                isSelected={activeThreadId === thread.threadId}
                onClick={() => openInvestigation(thread)}
              />
            );
          })}
        </List>
      )}
    </PageShell>
  );
}
