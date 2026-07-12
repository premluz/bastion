import { useMemo, useState } from 'react';
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from '@astryxdesign/core/SideNav';
import { StatusDot, type StatusDotVariant } from '@astryxdesign/core/StatusDot';
import { Divider } from '@astryxdesign/core/Divider';
import { TextInput } from '@astryxdesign/core/TextInput';
import { useSessionStore, type Turn } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { useSceneStore } from '../../engine/stores/sceneStore';
import { config } from '../../config';

// Adopted from .astryx-scratch/shell-side-nav/page.tsx: the SideNav +
// SideNavSection + SideNavItem + StatusDot primitives (lines 9-20,
// 162-211) exactly as documented. REJECTED: the template's own grouping
// content — `Workspace`/`Conversation` (lines 35-115) models projects, not
// investigations; its per-row `MoreMenu` (Pin/Rename/Archive/Delete, lines
// 141-156) has no real Merlin action behind any of those four items, so
// none were adopted (CLAUDE.md: no half-finished implementations). Its
// "Library"/"Account"/"Settings" rows (179-181, 186) are also out — no
// Merlin concept behind them, per this work order's explicit "Library: out."
const MODULE_ORDER = ['discover', 'research', 'investigate', 'monitor', 'portfolio'] as const;
type Module = (typeof MODULE_ORDER)[number];
const MODULE_LABEL: Record<Module, string> = {
  discover: 'Discover',
  research: 'Research',
  investigate: 'Investigate',
  monitor: 'Monitor',
  portfolio: 'Portfolio',
};

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function isModule(value: string): value is Module {
  return (MODULE_ORDER as readonly string[]).includes(value);
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(!config.sidebar.expanded);
  const [query, setQuery] = useState('');

  const turns = useSessionStore((state) => state.turns);
  const resetSession = useSessionStore((state) => state.reset);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const openArtifactId = useArtifactStore((state) => state.openArtifactId);
  const setOpenArtifact = useArtifactStore((state) => state.setOpenArtifact);
  const setActiveScene = useSceneStore((state) => state.setActiveScene);

  // Row model: a turn earns a sidebar row once it has a terminal state —
  // an open-able artifact, or a confirmed no-match. The still-in-flight
  // live turn (resolved, trail not yet settled) has neither and is
  // deliberately not shown here; Transcript is where in-progress work
  // lives (node-vocabulary.md's existing Trail law).
  const filtered = useMemo(
    () => turns.filter((turn) => turn.utterance.toLowerCase().includes(query.trim().toLowerCase())),
    [turns, query],
  );

  const rowsByModule = useMemo(() => {
    // artifactRef carried alongside its turn (not re-read from
    // turn.artifactRef at render time) so it's a plain string here, never
    // string|undefined — a row in `grouped` is only ever reached once its
    // artifact is confirmed to exist.
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

  function openTurn(artifactRef: string) {
    const artifact = artifacts[artifactRef];
    if (!artifact) return;
    setOpenArtifact(artifactRef);
    setActiveScene(artifact.scene);
  }

  return (
    <SideNav
      collapsible={{ isCollapsed, onCollapsedChange: setIsCollapsed }}
      header={<SideNavHeading heading="Merlin" />}
    >
      <SideNavSection title="Menu" isHeaderHidden>
        <SideNavItem label="New investigation" onClick={() => resetSession()} />
      </SideNavSection>
      <div style={{ padding: '0 var(--space-16) var(--space-12)' }}>
        <TextInput
          label="Search investigations"
          isLabelHidden
          value={query}
          onChange={setQuery}
          placeholder="Search investigations…"
          size="sm"
        />
      </div>
      <Divider />

      {MODULE_ORDER.map((module) => {
        const rows = rowsByModule.grouped[module];
        if (rows.length === 0) return null;
        return (
          <SideNavSection key={module} title={MODULE_LABEL[module]}>
            {rows.map(({ turn, artifactRef }) => {
              const dot: { variant: StatusDotVariant; label: string } =
                module === 'monitor' ? { variant: 'error', label: 'Alert' } : { variant: 'success', label: 'Answered' };
              return (
                <SideNavItem
                  key={turn.id}
                  label={truncate(turn.utterance, 40)}
                  isSelected={artifactRef === openArtifactId}
                  onClick={() => openTurn(artifactRef)}
                  endContent={<StatusDot variant={dot.variant} label={dot.label} />}
                />
              );
            })}
          </SideNavSection>
        );
      })}

      {rowsByModule.unresolved.length > 0 && (
        <SideNavSection title="Unresolved">
          {rowsByModule.unresolved.map((turn) => (
            <SideNavItem
              key={turn.id}
              label={truncate(turn.utterance, 40)}
              isDisabled
              endContent={<StatusDot variant="neutral" label="No match" />}
            />
          ))}
        </SideNavSection>
      )}
    </SideNav>
  );
}
