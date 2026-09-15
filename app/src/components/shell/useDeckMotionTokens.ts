import { useEffect, useState } from 'react';

// Motion values live in CSS (rule 15: motion is data, not decoration) but
// the deck's spring is integrated in JS, so they're read once from the
// cascade rather than duplicated as literals in the component — the same
// getComputedStyle escape hatch theme.default.css already documents for
// recharts consuming --motion-enter-ease. Defaults match shell.css so a
// missing token degrades to the documented values instead of NaN.
export interface DeckMotionTokens {
  stiffness: number;
  damping: number;
  depthDelayMs: number;
  parallax: number;
  commitRatio: number;
  dragRotationDeg: number;
  dragScale: number;
  backScaleStep: number;
  backOffsetPx: number;
}

const FALLBACK: DeckMotionTokens = {
  stiffness: 350, damping: 31, depthDelayMs: 55, parallax: 0.62, commitRatio: 0.3,
  dragRotationDeg: -4, dragScale: 0.96, backScaleStep: 0.05, backOffsetPx: 16,
};

const readNumber = (styles: CSSStyleDeclaration, name: string, fallback: number) => {
  const parsed = Number.parseFloat(styles.getPropertyValue(name));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function useDeckMotionTokens(): DeckMotionTokens {
  const [tokens, setTokens] = useState<DeckMotionTokens>(FALLBACK);
  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setTokens({
      stiffness: readNumber(styles, '--card-deck-stiffness', FALLBACK.stiffness),
      damping: readNumber(styles, '--card-deck-damping', FALLBACK.damping),
      depthDelayMs: readNumber(styles, '--card-deck-depth-delay', FALLBACK.depthDelayMs),
      parallax: readNumber(styles, '--card-deck-parallax', FALLBACK.parallax),
      commitRatio: readNumber(styles, '--card-deck-commit-ratio', FALLBACK.commitRatio),
      dragRotationDeg: readNumber(styles, '--card-deck-drag-rotation', FALLBACK.dragRotationDeg),
      dragScale: readNumber(styles, '--card-deck-drag-scale', FALLBACK.dragScale),
      backScaleStep: readNumber(styles, '--card-deck-back-scale-step', FALLBACK.backScaleStep),
      backOffsetPx: readNumber(styles, '--card-deck-back-offset', FALLBACK.backOffsetPx),
    });
  }, []);
  return tokens;
}
