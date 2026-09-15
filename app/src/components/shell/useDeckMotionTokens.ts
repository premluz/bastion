import { useEffect, useState } from 'react';

// Motion values live in CSS (rule 15: motion is data, not decoration) but
// the deck's spring is integrated in JS, so they're read once from the
// cascade rather than duplicated as literals in the component — the same
// getComputedStyle escape hatch theme.default.css already documents for
// recharts consuming --motion-enter-ease. Defaults match shell.css so a
// missing token degrades to the documented values instead of NaN.
// Trimmed 2026-09-16 when the deck moved from throw-a-card physics to a
// continuous scrub: parallax/commit-ratio/drag-rotation/drag-scale/
// depth-delay all described per-card throw behaviour that no longer
// exists, so they are gone from here and from shell.css rather than left
// as tokens nothing reads.
export interface DeckMotionTokens {
  stiffness: number;
  damping: number;
  backScaleStep: number;
  stepXPx: number;
  stepYPx: number;
  slantDeg: number;
}

const FALLBACK: DeckMotionTokens = {
  stiffness: 350, damping: 31, backScaleStep: 0.05,
  stepXPx: 32, stepYPx: 12, slantDeg: -9,
};

// getComputedStyle does NOT evaluate calc() inside a custom property — it
// hands back the literal "calc(64px + 24px)" (2026-09-16, caught live: a
// step token written as calc() silently fell back while a plain var()
// alias resolved fine, so the deck kept animating at a stale value). A
// probe element is given the token as a REAL property, which the engine
// must resolve to a used value, and that is what gets parsed.
const readLength = (probe: HTMLElement, name: string, fallback: number) => {
  probe.style.width = `var(${name})`;
  const parsed = Number.parseFloat(getComputedStyle(probe).width);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Unitless and deg-valued tokens can't go through the width probe, but
// they are never written as calc() either — a plain getPropertyValue is
// correct and cheaper for them.
const readNumber = (styles: CSSStyleDeclaration, name: string, fallback: number) => {
  const parsed = Number.parseFloat(styles.getPropertyValue(name));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function useDeckMotionTokens(): DeckMotionTokens {
  const [tokens, setTokens] = useState<DeckMotionTokens>(FALLBACK);
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    document.body.appendChild(probe);
    setTokens({
      stiffness: readNumber(styles, '--card-deck-stiffness', FALLBACK.stiffness),
      damping: readNumber(styles, '--card-deck-damping', FALLBACK.damping),
      backScaleStep: readNumber(styles, '--card-deck-back-scale-step', FALLBACK.backScaleStep),
      stepXPx: readLength(probe, '--card-deck-step-x', FALLBACK.stepXPx),
      stepYPx: readLength(probe, '--card-deck-step-y', FALLBACK.stepYPx),
      slantDeg: readNumber(styles, '--card-deck-slant', FALLBACK.slantDeg),
    });
    probe.remove();
  }, []);
  return tokens;
}
