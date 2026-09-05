import type { RefObject } from 'react';
import { LandingState } from './LandingState';
import { TranscriptAndComposer } from './TranscriptAndComposer';
import { TranscriptPaneMount } from './TranscriptPaneMount';
import { ArtifactStackMount } from './ArtifactStackMount';
import { CollapsedPaneChip } from './CollapsedPaneChip';
import { MobilePaneModals } from './MobilePaneModals';
import type { Page } from '../../engine/stores/pageStore';
import layout from './Frame.module.css';

interface WorkbenchRowProps {
  rowRef: RefObject<HTMLDivElement | null>;
  page: Page;
  hasStarted: boolean;
  isMaximizedStack: boolean;
  isMobile: boolean;
  showTranscript: boolean;
  showArtifact: boolean;
  collapsedPanes: string[];
  closeStack: () => void;
  toggleChatPane: () => void;
  renderPage: (page: Page) => React.ReactNode;
}

// Extracted from Frame.tsx (crossed the 200-line budget once mobile
// modals landed) — the row itself: content column + artifact/transcript
// panes (desktop, inline in the flex row) + their mobile Dialog
// counterparts (MobilePaneModals, rendered as a sibling of the row, not
// inside it — a fullscreen dialog has no row-sharing width to negotiate).
export function WorkbenchRow({
  rowRef,
  page,
  hasStarted,
  isMaximizedStack,
  isMobile,
  showTranscript,
  showArtifact,
  collapsedPanes,
  closeStack,
  toggleChatPane,
  renderPage,
}: WorkbenchRowProps) {
  return (
    <>
      <div
        className={layout.row}
        ref={rowRef}
        // Lets PageShell's own outer padding (its right side only) fall
        // back to 0 when a side pane sits next to it — the row's own gap
        // (below) already separates them at that point, so PageShell's
        // page-margin padding would only double up with it. 1/0 rather
        // than a boolean so the CSS side can consume it directly in a
        // calc() (see PageShell.module.css's own comment on this
        // variable). --content-artifact-gap (2026-08-17): separate flag,
        // artifact-only (not "any sibling pane" like the one above) — the
        // wider content↔artifact gap (.contentColumn's own margin-right)
        // should only apply when the artifact pane is genuinely the
        // content column's next visible neighbor, not when only chat is
        // open (content↔chat with no artifact between them would wrongly
        // inherit the wider spacing otherwise).
        style={{
          '--content-has-sibling-pane': showArtifact || showTranscript ? 1 : 0,
          '--content-artifact-gap': showArtifact ? 1 : 0,
        } as React.CSSProperties}
      >
        {/* Maximize (Phase 8H): the stack takes the full row width and
            this column hides — display:none, not unmounted, so an
            in-progress composer draft survives a maximize/restore round
            trip. Best-practice "maximize a panel" pattern (VS Code, most
            IDE-style workbenches): one pane goes full-width, its sibling
            steps aside entirely rather than sharing a now-meaningless
            split. */}
        <div className={layout.contentColumn} style={{ display: isMaximizedStack ? 'none' : 'flex' }}>
          {page === 'home' ? hasStarted ? <TranscriptAndComposer /> : <LandingState /> : renderPage(page)}
        </div>
        {/* Right side: Artifacts is the ONLY pane, global across every
            page per the routing law ("pages never host scene renders")
            — investigating an entity from a page still lands its result
            here without leaving that page. Slides in/out
            (ArtifactStackMount), not a plain mount toggle — see its own
            file for why. Desktop only (!isMobile): on mobile these two
            panes render as fullscreen Dialogs instead (below), never
            inline in this flex row — the row's own three-in-a-row/
            collapse math (usePaneFitCollapse) is a desktop-scale-down
            concern, a modal has no "share the row" question to answer
            at all. */}
        {!isMobile && <ArtifactStackMount show={showArtifact} />}
        {!isMobile && collapsedPanes.includes('artifact') && <CollapsedPaneChip pane="artifact" />}
        {/* Chat pane on the right (2026-07-30): moved from leftmost
            position to trailing edge, rendering last in the row. Hidden
            on Home (which already shows the transcript as its own
            content column below) and while maximized. Phase 18:
            `showTranscript` already folds in the collapse trigger —
            collapsed reuses this mount's own slide-out. */}
        {!isMobile && <TranscriptPaneMount show={showTranscript} />}
        {!isMobile && collapsedPanes.includes('transcript') && <CollapsedPaneChip pane="transcript" />}
      </div>
      {/* Mobile modals (Phase 20 WO-3, 2026-08-21 — direct order: "the
          chat opens in a modal, which should be a mobile modal of
          Astryx. The same for the artifacts"). Mounted only when
          isMobile, its own two Dialogs each still gate on their own
          showArtifact/showTranscript individually. */}
      {isMobile && (
        <MobilePaneModals showArtifact={showArtifact} showTranscript={showTranscript} closeStack={closeStack} toggleChatPane={toggleChatPane} />
      )}
    </>
  );
}
