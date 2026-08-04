import { useMemo } from 'react';
import { useSessionStore } from '../../engine/stores/sessionStore';
import { useArtifactStore } from '../../engine/stores/artifactStore';
import { type Page } from '../../engine/stores/pageStore';
import { PaneTitleBar } from './PaneTitleBar';
import { ArtifactStackControl } from './ArtifactStackControl';
import { ChatPaneControl } from './ChatPaneControl';

// Rendered once in Frame.tsx as the full-row-width sibling above the pane
// row, for every page. Icon-only for every place page (direct feedback,
// 2026-08-02: page titles moved out of this top bar into each page's own
// pane — PageShell.tsx's own PaneTitleBar, styled like the artifact
// pane's title — so this bar now carries only the chat/artifacts toggles
// that need to stay full-row-width regardless of which page is open).
// entity-detail's Watch button moved the same way, into
// EntityDetailPage.tsx's own titleEndContent. Home is the one exception,
// left untouched: it isn't a PageShell page (no static title, no pane of
// its own — LandingState or TranscriptAndComposer directly), and its
// title is live investigation state, not a page label.
export function WorkbenchTitleBar({ page }: { page: Page }) {
  const openArtifactId = useArtifactStore((state) => state.openArtifactId);
  const artifacts = useArtifactStore((state) => state.artifacts);
  const activeThreadId = useSessionStore((state) => state.activeThreadId);
  const turns = useSessionStore((state) => state.turns);

  const activeThreadTurns = useMemo(() => turns.filter((turn) => turn.threadId === activeThreadId), [turns, activeThreadId]);

  if (page === 'home') {
    const activeTitle =
      (openArtifactId && artifacts[openArtifactId]?.scene.title) ??
      activeThreadTurns[activeThreadTurns.length - 1]?.utterance ??
      'New investigation';
    return <PaneTitleBar title={activeTitle} endContent={<ArtifactStackControl />} />;
  }

  // Every other page (including entity-detail, whose title/Watch button
  // now live in EntityDetailPage.tsx's own pane) gets the same icon-only
  // bar — no per-page branching needed once the title is gone.
  return (
    <PaneTitleBar
      endContent={
        <>
          <ChatPaneControl />
          <ArtifactStackControl />
        </>
      }
    />
  );
}
