import { useEffect, useMemo, useState } from 'react';
import styles from './LabelReveal.module.css';

interface LabelRevealProps {
  text: string;
  durationMs: number;
}

// How many of the newest characters sit in the fading tail at once.
const FEATHER_CHARS = 8;
const MIN_REVEAL_MS = 300;

// Streams a step's real label in the instant it settles. Reworked
// 2026-10-20 (direct order: "the effect feels like a mask — build it like
// the vivid-layer Streaming component, no dependency"). That component
// releases characters at an even pace and fades each new one in, so the
// leading edge is feathered instead of a hard clip line. Its DOM — a <span>
// per character via Streamdown — would break this component's own standing
// order (2026-09-06: no tag per letter; the sentence must stay selectable
// whole), so the look is rebuilt with three runs of the SAME string:
//   settled  plain text, fully inked
//   tail     the newest FEATHER_CHARS, one span, gradient-filled ink→clear
//   pending  the rest, present but transparent — layout never reflows as
//            text arrives (the reference grows the text and re-wraps), and
//            a selection always covers the whole sentence
// Pace: even, across the same budget the clip-path sweep used — the step's
// own durationMs, floored. When done it is one plain text node again.
export function LabelReveal({ text, durationMs }: LabelRevealProps) {
  const glyphs = useMemo(() => Array.from(text), [text]);
  const [revealed, setRevealed] = useState(() => (prefersReducedMotion() ? glyphs.length : 0));

  useEffect(() => {
    if (prefersReducedMotion()) {
      setRevealed(glyphs.length);
      return;
    }
    // The tail drains too: the run ends once the feather has passed the
    // last character, so the final letters fade in like every other.
    const total = glyphs.length + FEATHER_CHARS;
    const msPerGlyph = Math.max(durationMs, MIN_REVEAL_MS) / total;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const next = Math.min(total, Math.floor((now - start) / msPerGlyph));
      setRevealed(next);
      if (next < total) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [glyphs, durationMs]);

  if (revealed >= glyphs.length + FEATHER_CHARS) return <span>{text}</span>;

  const tailStart = Math.max(0, revealed - FEATHER_CHARS);
  const tailEnd = Math.min(glyphs.length, revealed);
  return (
    <span>
      {glyphs.slice(0, tailStart).join('')}
      <span className={styles.tail}>{glyphs.slice(tailStart, tailEnd).join('')}</span>
      <span className={styles.pending}>{glyphs.slice(tailEnd).join('')}</span>
    </span>
  );
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
