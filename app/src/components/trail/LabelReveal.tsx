import styles from './LabelReveal.module.css';

interface LabelRevealProps {
  text: string;
  durationMs: number;
}

// Streams a step's real label in the instant it settles (2026-09-06,
// direct order: "we lost text streaming... let's analyze this one" —
// restoring the reveal TextChunkReveal.tsx used to provide, deleted the
// same round StepRow's active state switched to a fixed "Thinking" label
// with nothing left for it to reveal). Replaces that per-word <span>
// technique entirely: evaluated the ai-elements "reasoning" component's
// own registry source directly (registry.ai-sdk.dev/reasoning.json) —
// its shimmer is the identical bg-clip-text + animated background-
// position technique this app already built itself (ThinkingTrail.
// module.css's own .shimmerText, no new dependency needed there), and
// its word/letter streaming isn't in that component at all — it's
// delegated to Streamdown, a separate markdown-streaming renderer, off
// this project's closed dependency list and far more than a plain-text
// step label needs.
//
// Direct order for THIS component specifically: "letter by letter...
// without breaking apart words into individual letters for animation
// and entering html tag wrapped for each letter... still in code can
// select whole sentence nicely." A per-letter/per-word <span> reveal
// (TextChunkReveal's own prior technique) fails exactly that — each
// span is its own selection boundary, so selecting the sentence mid- or
// post-stream selects word-by-word fragments, not clean prose. This
// renders the label as ONE real text node (zero wrapper spans inside
// it) and reveals it with an animated clip-path sweep instead — the
// same "animate a mask over real content" philosophy TimeSeries.tsx's
// chart-reveal and AssetTrendGlyph's line-draw already use elsewhere in
// this app, just applied to text. Genuinely selectable as a whole
// sentence at any point, including mid-animation.
export function LabelReveal({ text, durationMs }: LabelRevealProps) {
  return (
    <span
      className={styles.reveal}
      style={{ '--reveal-duration': `${Math.max(durationMs, 300)}ms` } as React.CSSProperties}
    >
      {text}
    </span>
  );
}
