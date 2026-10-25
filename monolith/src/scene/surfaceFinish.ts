import { PALETTE } from '../brand/palette';

/** The physical finish of the body, per appearance. Geometry and glow are shared; only the matter differs. */
export interface SurfaceFinish {
  /** 0 = opaque ceramic, toward 1 = frosted glass that lets the room through. */
  readonly transmission: number;
  readonly thickness: number;
  readonly ior: number;
  /** The colour light takes on as it travels through the body, and over what distance. */
  readonly depthColor: string;
  readonly depthDistance: number;
  /** Multiplies the Roughness control, so the knob keeps working in both appearances. */
  readonly roughnessScale: number;
  readonly clearcoat: number;
  readonly clearcoatRoughness: number;
  readonly iridescence: number;
  readonly sheen: number;
  readonly sheenColor: string;
  /** Light gathering along the body's edges, where the glass is thinnest (0 = none). */
  readonly edgeLight: number;
  /**
   * Without transmission (lower quality tiers) glass would read as murky grey, so the body is lit
   * from within by this colour at this strength instead.
   */
  readonly fallbackColor: string;
  readonly fallbackLift: number;
}

/** Smoked graphite ceramic: dense, matte-satin, nearly opaque. */
export const GRAPHITE_CERAMIC: SurfaceFinish = {
  transmission: 0,
  thickness: 0,
  ior: 1.5,
  depthColor: PALETTE.graphite,
  depthDistance: 1,
  roughnessScale: 1,
  clearcoat: 0.1,
  clearcoatRoughness: 0.5,
  iridescence: 0,
  sheen: 0,
  sheenColor: PALETTE.graphite,
  edgeLight: 0,
  fallbackColor: PALETTE.graphite,
  fallbackLift: 0,
};

/** Frosted optical glass: milky, lit from within, crisp at the edges, a faint pearl at grazing angles. */
export const FROSTED_GLASS: SurfaceFinish = {
  transmission: 0.58,
  thickness: 1.6,
  ior: 1.45,
  depthColor: PALETTE.glassDepth,
  depthDistance: 3.5,
  roughnessScale: 0.45,
  clearcoat: 1,
  clearcoatRoughness: 0.07,
  iridescence: 0.4,
  sheen: 0.35,
  sheenColor: PALETTE.pearl,
  edgeLight: 0.45,
  fallbackColor: PALETTE.glassDepth,
  fallbackLift: 0.26,
};
