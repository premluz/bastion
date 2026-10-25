import { PALETTE } from '../brand/palette';
import type { Appearance } from '../settings';
import { FROSTED_GLASS, GRAPHITE_CERAMIC, type SurfaceFinish } from './surfaceFinish';

export interface AccentLight {
  readonly color: string;
  readonly intensity: number;
  readonly position: readonly [number, number, number];
  readonly rotationY: number;
  readonly scale: readonly [number, number];
}

export interface AppearancePreset {
  /** The page ground behind the monolith. */
  readonly ground: string;
  readonly base: string;
  readonly surface: SurfaceFinish;
  /** Tinted area lights in the environment, for gradients across the faces. */
  readonly accents: readonly AccentLight[];
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
    surface: GRAPHITE_CERAMIC,
    accents: [],
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
    base: PALETTE.glassBody,
    surface: FROSTED_GLASS,
    accents: [
      { color: PALETTE.studioCool, intensity: 1.4, position: [-8, 2, 3], rotationY: Math.PI / 2.4, scale: [7, 9] },
      { color: PALETTE.studioWarm, intensity: 1.2, position: [8, 1, 3], rotationY: -Math.PI / 2.4, scale: [7, 9] },
      // Thin softbox strips: crisp reflected highlights travelling across the clearcoat.
      { color: PALETTE.edgeNeutralLight, intensity: 4, position: [-4, 4, 6], rotationY: Math.PI / 5, scale: [0.6, 10] },
      { color: PALETTE.edgeNeutralLight, intensity: 3, position: [6, 3, 5], rotationY: -Math.PI / 4, scale: [0.5, 9] },
    ],
    edgeColor: PALETTE.edgeNeutralLight,
    skinGlow: 0.6,
    wallGlow: 5.5,
    edgeScale: 0.04,
    environment: 0.6,
    key: 1.7,
    fill: 0.35,
    ambient: 0.1,
    bloom: 0.14,
    haloThreshold: 1,
    lightGround: 1,
    stain: 1.2,
  },
};
