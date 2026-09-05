import { useMemo } from 'react';
import { chunkText } from './chunkText';
import './trail.css';

interface TextChunkRevealProps {
  text: string;
  // Real step pacing (ThinkingStep.durationMs), never a token — same
  // "reuse the fixture's own data verbatim" rule the clip-path wipe this
  // replaces already followed. The chunk-to-chunk stagger is DERIVED
  // from this (durationMs ÷ chunk count, clamped), not a new hardcoded
  // motion value, so total reveal time still tracks genuine step data
  // regardless of how many chunks a given label happens to split into.
  durationMs: number;
}

// Modular, reusable chunk-based text reveal (2026-08-21, direct order:
// "let's build something modular reusable, simple and effective... no
// breaking into words" — imitating a GSAP-based reference the architect
// supplied, reimplemented on this project's own closed motion
// architecture: plain CSS keyframes + animation-delay stagger, the SAME
// mechanism AnimatedListItem.tsx already establishes for entrance
// animation (a --index custom property driving `calc()` inside
// animation-delay), not a requestAnimationFrame loop and not GSAP — no
// animation library is on this project's closed dependency list
// (CLAUDE.md §5).
//
// SUPERSEDES the prior clip-path-wipe treatment (useTextReveal.ts +
// trail.css's own --reveal/.merlin-text-reveal, both DELETED — StepRow
// was their only real consumer). Chunking via chunkText.ts — always
// exactly one word per chunk now (2026-08-23 follow-up, direct feedback:
// "instead multiple letters it always prints 1 word... always 1 and
// faster" — reverses the prior randomly-sized 1-3 word grouping). Visual
// treatment is a pure opacity fade now too (same round: "no blur just
// fade in, and not slide up") — trail.css's .merlin-chunk dropped its
// blur/translateY, see that file's own comment.
export function TextChunkReveal({ text, durationMs }: TextChunkRevealProps) {
  const chunks = useMemo(() => chunkText(text), [text]);

  // Total reveal time stays pinned to the step's own real durationMs:
  // dividing it across however many chunks this particular label
  // produced (now always one chunk per word, so more chunks per label
  // than before), floored at 15ms so a very short label doesn't stretch
  // each chunk's own fade into visible slow motion, and capped at 40ms
  // so a very long label doesn't drag the LAST chunk's reveal out past
  // the step's own intended pacing. Halved again from 30–80ms
  // (2026-08-23 follow-up, direct feedback: "always 1 and faster") — same
  // clamp shape, tighter bounds, matching a genuine word-for-word reveal
  // rather than 2-3-word groups.
  const stagger = Math.min(40, Math.max(15, durationMs / Math.max(chunks.length, 1)));

  return (
    <span className="merlin-chunk-reveal-root" style={{ '--chunk-stagger': `${stagger}ms` } as React.CSSProperties}>
      {chunks.map((chunk, index) => (
        <span key={index} className="merlin-chunk" style={{ '--chunk-index': index } as React.CSSProperties}>
          {chunk}
        </span>
      ))}
    </span>
  );
}
