import { useEffect, useRef } from "react";

// Option B (architect-ordered): --reveal drives a clip-path wipe via a
// native CSS transition (trail.css's .merlin-text-reveal + @property
// --reveal), not a requestAnimationFrame render loop — same "motion via
// CSS transitions" architecture as everything else in this project, and
// it means prefers-reduced-motion can disable the whole effect with one
// CSS rule (transition: none), no JS branching needed to satisfy that
// half of the gate.
//
// This hook's only job is priming --reveal-duration with the step's own
// real durationMs (never a token, never invented — reusing the fixture's
// exact pacing data per the order) and then flipping --reveal from 0 to
// 1 so the transition has something to animate across. Double rAF: a
// single frame isn't reliably enough for the browser to paint the "0"
// state before the "1" write lands in the same frame, which would skip
// the transition entirely (a well-known trigger-a-CSS-transition
// pitfall, not guessed around).
export function useTextReveal(durationMs: number, isActive: boolean) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isActive) return;

    el.style.setProperty("--reveal-duration", `${durationMs}ms`);
    el.style.setProperty("--reveal", "0");

    let second: number | null = null;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        el.style.setProperty("--reveal", "1");
      });
    });

    return () => {
      cancelAnimationFrame(first);
      if (second !== null) cancelAnimationFrame(second);
    };
  }, [durationMs, isActive]);

  return ref;
}
