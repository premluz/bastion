/** Rendering cost tiers. `high` is the reference look; lower tiers drop the most expensive passes first. */
export type Quality = 'high' | 'balanced' | 'low';

export interface QualitySpec {
  /** Device pixel ratio range for the canvas. */
  readonly dpr: readonly [number, number];
  readonly multisampling: number;
  /** The light thrown sideways from faces the camera cannot see (an extra offscreen pass plus blur). */
  readonly sideGlow: boolean;
  /** Frosted-glass transmission, which re-renders the scene behind the glass. */
  readonly transmission: boolean;
}

export const QUALITY: Readonly<Record<Quality, QualitySpec>> = {
  high: { dpr: [1, 2], multisampling: 4, sideGlow: true, transmission: true },
  balanced: { dpr: [1, 1.5], multisampling: 2, sideGlow: true, transmission: false },
  low: { dpr: [1, 1], multisampling: 0, sideGlow: false, transmission: false },
};
