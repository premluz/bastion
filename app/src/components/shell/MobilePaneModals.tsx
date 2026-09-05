import { Layout, LayoutContent, LayoutFooter } from '@astryxdesign/core/Layout';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { ArtifactStackMount } from './ArtifactStackMount';
import { ScrollAnchor } from './ScrollAnchor';
import { Transcript } from './Transcript';
import { ChatBar } from './ChatBar';
import pane from './PanePadding.module.css';
import viewport from './ChatViewport.module.css';

interface MobilePaneModalsProps {
  showArtifact: boolean;
  showTranscript: boolean;
  closeStack: () => void;
  toggleChatPane: () => void;
}

// Extracted from Frame.tsx (over the 200-line budget once this landed) —
// Phase 20 WO-3, 2026-08-21, direct order: "the chat opens in a modal,
// which should be a mobile modal of Astryx. The same for the artifacts."
// Astryx's own Dialog, variant="fullscreen" — the SAME primitive named
// in the order, not a hand-rolled overlay. Rendered as a sibling of
// Frame's own .row entirely (not inside it) since a fullscreen dialog
// has no row-sharing role to play — this component is mounted once,
// unconditionally, and each Dialog's own `isMobile && show*` gating
// happens at the call site (Frame.tsx) before this component is even
// rendered, so both branches here are pure "is this pane naturally
// open" checks, nothing else. onOpenChange(false) reuses the EXACT SAME
// close actions the desktop pane controls already call
// (ArtifactStackControl's closeStack, ChatPaneControl's toggleChatPane)
// — same close behavior, different presentation, not a second close
// pathway invented for mobile. collapsedPanes never applies here:
// usePaneFitCollapse's row-width overflow check has nothing to measure
// inside a fullscreen dialog — these two mounts are excluded from
// Frame's own .row entirely by the caller, so they can never contribute
// to that check's own child-width sum.
//
// Chat composer fixed at the bottom (2026-08-21 fix — direct feedback:
// "ours is on top and moving down," referencing Astryx's own chat-modal
// pattern which docks the composer at the bottom of the sheet). Root
// cause: this Dialog originally reused TranscriptPaneMount whole (which
// renders Transcript AND ChatBar together inside one scrolling flex
// column) inside a single scrollable LayoutContent — with no height-
// constrained flex parent, the composer just sat wherever content ended
// rather than staying pinned, drifting down as messages grew. Fix: split
// the transcript into `content` (LayoutContent, isScrollable — scrolls
// independently) and the composer into `footer` (LayoutFooter — Astryx's
// own "fixed-height content at the bottom of a layout" primitive, per
// its own docstring), matching the SAME real Astryx-documented Dialog
// composition shown in Dialog.d.ts's own example
// (header/content/footer). TranscriptAndComposer.tsx's own
// ScrollAnchor/Transcript/pane.padded/viewport pieces are reused
// directly here rather than as one mount, since content and footer need
// to land in separate Layout slots.
//
// Nesting (revised 2026-08-22, direct feedback: "artifacts open as
// another modal covering fully the old (not replacing)... nested modal[s]
// asses first"). Was fully mutually exclusive on mobile (2026-08-21:
// "modal windows should not stack") — usePaneVisibility.ts made
// showArtifact/showTranscript never both true. That rule is now gone
// (see that file's own comment): both can be true simultaneously, and
// this component renders the chat Dialog BEFORE the artifact Dialog in
// JSX/DOM order specifically so, when both are open, the artifact Dialog
// — opened second, painted second — naturally covers the chat Dialog
// underneath via the browser's own native <dialog> top-layer stacking.
// Closing the artifact reveals chat still open, not gone. Chat opening
// while artifact is already open is a separate case, still governed by
// usePaneVisibility's naturalShowTranscript/naturalShowStack computation
// (unchanged) — this component has no exclusivity logic of its own
// either way, it only renders what it's told to.
//
// Header padding fix (2026-08-22 — direct feedback: "should be full
// screen but with padding, currently modal header lack padding"). Root
// cause: Dialog's own `padding` prop (removed here) is a container-wide
// setting (Dialog.js: paddingInnerX/Y, paddingOuterX/Y cascading to every
// slot) — the `padding={0}` originally passed to get edge-to-edge content
// also collapsed DialogHeader's own padding, since DialogHeader has no
// padding prop of its own to override it back (confirmed via
// DialogHeader.d.ts). Fix: padding is no longer set on Dialog itself
// (theme default applies, giving the header real breathing room);
// content/footer each already carry their own explicit padding={0}, so
// they stay edge-to-edge exactly as before — only the header's padding
// changed.
export function MobilePaneModals({ showArtifact, showTranscript, closeStack, toggleChatPane }: MobilePaneModalsProps) {
  return (
    <>
      {showTranscript && (
        <Dialog isOpen={showTranscript} onOpenChange={(open) => !open && toggleChatPane()} variant="fullscreen">
          <Layout
            header={<DialogHeader title="Chat" onOpenChange={(open) => !open && toggleChatPane()} />}
            content={
              <LayoutContent isScrollable padding={0}>
                <ScrollAnchor>
                  <Transcript />
                </ScrollAnchor>
              </LayoutContent>
            }
            footer={
              <LayoutFooter padding={0}>
                <div className={pane.padded}>
                  <div className={viewport.viewport}>
                    <ChatBar />
                  </div>
                </div>
              </LayoutFooter>
            }
          />
        </Dialog>
      )}
      {showArtifact && (
        <Dialog isOpen={showArtifact} onOpenChange={(open) => !open && closeStack()} variant="fullscreen">
          <Layout
            header={<DialogHeader title="Artifacts" onOpenChange={(open) => !open && closeStack()} />}
            content={
              <LayoutContent isScrollable padding={0}>
                <ArtifactStackMount show isMobile />
              </LayoutContent>
            }
          />
        </Dialog>
      )}
    </>
  );
}
