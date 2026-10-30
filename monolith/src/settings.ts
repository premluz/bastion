import type { IntelligenceParams } from './monolith/intelligence/field';
import type { MaterialFamily } from './scene/materialFamilies';
import { DEFAULT_OPTICAL_TUNING, type OpticalTuning } from './opticalTuning';

export type Appearance = 'dark' | 'light';

/** contained — light only escapes through the cuts; incandescent — the whole body glows from within. */
export type GlowMode = 'contained' | 'incandescent';

/** Light channels and diffusion are 0–1 artistic levels; the scene maps them to physical-ish values. */
export interface MaterialParams extends Partial<OpticalTuning> {
  readonly family: MaterialFamily;
  /** 0 removes specular, clearcoat and sheen; 1 retains the chosen finish. */
  readonly gloss: number;
  /** Absolute transmission; omitted uses the family's appearance-specific default. */
  readonly translucency?: number;
  /** Strength of angle-dependent thin-film colour and dispersion. */
  readonly spectral: number;
  /** Slot width in model units (the cube spans 2). */
  readonly cutWidth: number;
  readonly roughness: number;
  readonly reflectance: number;
  readonly edge: number;
  /** Grain frequency per model unit — high values push the texture below visibility. */
  readonly grainScale: number;
  readonly grainAmount: number;
  /** A — brightness of the hidden source. */
  readonly core: number;
  /** B — brightness of the slot walls. */
  readonly cutLight: number;
  /** Steady orange emission from the real interior cut faces, independent of travelling seam light. */
  readonly innerWallGlow: number;
  /** C — internal light reaching the exterior ceramic. */
  readonly spill: number;
  /** D — how far that light penetrates beneath the surface. */
  readonly diffusion: number;
  readonly absorption: number;
  readonly falloff: number;
  readonly glowMode: GlowMode;
  /** Incandescent mode only: how hot the body runs, from ember to near white. */
  readonly incandescence: number;
  /** Outer glow around the monolith, in either glow mode. */
  readonly halo: number;
  /** Legacy on/off rounding control; cornerRadius takes precedence when supplied. */
  readonly softCorners: boolean;
  /** Rounded edge radius in model units. Omit to use the legacy softCorners setting. */
  readonly cornerRadius?: number;
  /** Light filling the whole body from within, on top of the cuts' own (0 = only near the cuts). */
  readonly bodyLight: number;
  /** On a pale ground: 0 lets the inner light scatter to peach-white, 1 keeps it a saturated apricot. */
  readonly paleWarmth: number;
}

export const DEFAULT_MATERIAL: MaterialParams = {
  ...DEFAULT_OPTICAL_TUNING,
  family: 'current',
  gloss: 1,
  spectral: 1,
  cutWidth: 0.034,
  roughness: 0.72,
  reflectance: 0.45,
  edge: 0.3,
  grainScale: 1400,
  grainAmount: 0.5,
  core: 0.75,
  cutLight: 0.65,
  innerWallGlow: 0,
  spill: 0.08,
  diffusion: 0.15,
  absorption: 0.6,
  falloff: 2,
  glowMode: 'contained',
  incandescence: 0.7,
  halo: 0.2,
  softCorners: false,
  bodyLight: 0,
  paleWarmth: 0,
};

export interface IntelligenceSettings extends IntelligenceParams {
  readonly paused: boolean;
}

export const DEFAULT_INTELLIGENCE: IntelligenceSettings = {
  activity: 0.25,
  flowSpeed: 0.18,
  impulse: 0.4,
  mode: 'thinking',
  style: 'currents',
  paused: false,
};

export interface CameraSettings {
  readonly autoRotate: boolean;
  /** Orbit speed while auto-rotating. */
  readonly rotationSpeed: number;
}

export const DEFAULT_CAMERA: CameraSettings = {
  autoRotate: false,
  rotationSpeed: 0.6,
};

/** Everything a state or a host can tune; each part is eased on its own. */
export interface MonolithSettings {
  readonly material: MaterialParams;
  readonly intelligence: IntelligenceSettings;
  readonly camera: CameraSettings;
}

export const DEFAULT_SETTINGS: MonolithSettings = {
  material: DEFAULT_MATERIAL,
  intelligence: DEFAULT_INTELLIGENCE,
  camera: DEFAULT_CAMERA,
};

/** A partial set of settings: a host override or a named state. */
export interface MonolithSettingsInput {
  readonly material?: Partial<MaterialParams>;
  readonly intelligence?: Partial<IntelligenceSettings>;
  readonly camera?: Partial<CameraSettings>;
}
