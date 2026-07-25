import { useMemo } from 'react';
import { Text } from '@astryxdesign/core/Text';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { ArtifactStackControl } from './ArtifactStackControl';

// Home's own top bar (Phase 8H) — current artifact's title on the left
// (the most recent turn's title before anything is open), the artifact
// stack control on the right. Distinct from the persistent AppShell
// header, which only ever holds ThemeSwitch. Extracted from Frame.tsx
// (which was over the 200-line file budget) during the panel-layout
// restructure order — same component, unchanged, now also rendered
// ABOVE Frame's content+stack row instead of nested inside the narrower
// content column, so it spans the row's full width as ordered ("this top
// bar with title should run across").
//
// Left/right padding matches ScrollAnchor's own content padding
// (var(--space-24)) — same fix as PageShell's own title bar, made here
// too so the two title bars' left/right position stays matched (the
// "same... position as the chatbot title" rule PageShell's own comment
// already states) rather than re-diverging by fixing only one of them.
// The composer dock below stays at its own, separately-ordered
// space-16 — that was a deliberate, narrower ask about the composer
// specifically, not a "everything in Home is 16px" rule, and the title
// aligning with the larger transcript content area reads as the more
// coherent match of the two.
export function HomeTopBar() {
  const openArtifactId = useArtifactStore((state) => state.openArtifactId);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const activeThreadId = useSessionStore((state) => state.activeThreadId);
  const turns = useSessionStore((state) => state.turns);
  // Scoped to the active thread (Investigation threading order) — the
  // global last turn could belong to an unrelated thread (a background
  // alert, or simply a different investigation) once more than one
  // exists.
  const activeThreadTurns = useMemo(() => turns.filter((turn) => turn.threadId === activeThreadId), [turns, activeThreadId]);
  const activeTitle =
    (openArtifactId && artifacts[openArtifactId]?.scene.title) ??
    activeThreadTurns[activeThreadTurns.length - 1]?.utterance ??
    'New investigation';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-12) var(--space-24)',
        flexShrink: 0,
      }}
    >
      <Text type="label" weight="semibold">
        {activeTitle}
      </Text>
      <ArtifactStackControl />
    </div>
  );
}
