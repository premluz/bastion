import { ScrollAnchor } from './ScrollAnchor';
import { Transcript } from './Transcript';
import { ChatBar } from './ChatBar';
import pane from './PanePadding.module.css';
import viewport from './ChatViewport.module.css';

// Extracted from Frame.tsx's own Home render path (Demo Flow #1 order) so
// TranscriptPaneMount can mount the exact same transcript+composer, byte-
// identical, rather than a second hand-copied version drifting from Home's
// own over time.
export function TranscriptAndComposer() {
  return (
    <>
      <ScrollAnchor>
        <Transcript />
      </ScrollAnchor>
      <div className={pane.padded} style={{ flexShrink: 0 }}>
        <div className={viewport.viewport}>
          <ChatBar />
        </div>
      </div>
    </>
  );
}
