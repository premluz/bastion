import { PALETTE } from '../brand/palette';
import type { Appearance } from '../state/studioStore';

export interface AppearancePreset {
  /** The page ground behind the monolith. */
  readonly ground: string;
  readonly base: string;
  readonly edgeColor: string;
  /** Scales the subsurface glow on the exterior skin. */
  readonly skinGlow: number;
  /** Scales emission from the slot walls. */
  readonly wallGlow: number;
  readonly edgeScale: number;
  readonly environment: number;
  readonly key: number;
  readonly fill: number;
  readonly ambient: number;
  readonly bloom: number;
  /** Lowest bloom threshold the outer-glow knob may reach; a pale ground must not bloom its own ceramic. */
  readonly haloThreshold: number;
  /** 1 on a pale ground: walls reflect less studio light and the glow stains the ceramic instead of only adding light. */
  readonly lightGround: number;
  /** How strongly exterior glow tints the reflected colour of the ceramic. */
  readonly stain: number;
}

export const APPEARANCES: Record<Appearance, AppearancePreset> = {
  dark: {
    ground: PALETTE.groundDark,
    base: PALETTE.graphite,
    edgeColor: PALETTE.edgeNeutralDark,
    skinGlow: 1,
    wallGlow: 5,
    edgeScale: 0.25,
    environment: 1.25,
    key: 2.2,
    fill: 0.7,
    ambient: 0.12,
    bloom: 0.28,
    haloThreshold: 0.08,
    lightGround: 0,
    stain: 0,
  },
  light: {
    ground: PALETTE.groundLight,
    base: PALETTE.ceramic,
    edgeColor: PALETTE.edgeNeutralLight,
    skinGlow: 1.3,
    wallGlow: 5.5,
    edgeScale: 0.04,
    environment: 0.72,
    key: 1.05,
    fill: 0.5,
    ambient: 0.1,
    bloom: 0.14,
    haloThreshold: 1,
    lightGround: 1,
    stain: 5,
  },
};
