import { DEFAULT_SETTINGS, type MonolithSettings } from './settings';
import type { MonolithState } from './states';

const EDGE_ILLUMINATION = 0.3;
const ACTIVE_EDGE_ILLUMINATION = 0.6;
const LIGHT_CUT_ILLUMINATION = 1;
const LIGHT_CUT_WIDTH = 0.06;
const LIGHT_BEAM_WIDTH = LIGHT_CUT_WIDTH / DEFAULT_SETTINGS.material.cutWidth;
const LIGHT_GROUND = { family: 'current', core: 1, cutLight: LIGHT_CUT_ILLUMINATION, cutWidth: LIGHT_CUT_WIDTH, beamWidth: LIGHT_BEAM_WIDTH, spill: 0.3, diffusion: 0.35, bodyLight: 0.75, edge: EDGE_ILLUMINATION, softCorners: true, paleWarmth: 0.35 } as const;
const REST_LIGHT = { halo: 0, core: DEFAULT_SETTINGS.material.core, cutLight: DEFAULT_SETTINGS.material.cutLight,
  spill: 0, bodyLight: 0 } as const;
const ACTIVE_LIGHT = { ...LIGHT_GROUND, halo: 0.04, core: 0.85, spill: 0.04, diffusion: 0.15,
  bodyLight: 0.06, edge: ACTIVE_EDGE_ILLUMINATION, paleWarmth: 0, translucency: 0.12, opticalThickness: 0.45, spectral: 0.15 } as const;

/** Studio's Web light profile and the app's resting light cube share one calibrated default. */
export const WEB_LIGHT_DEFAULT = {
  material: {
    ...DEFAULT_SETTINGS.material,
    gloss: 0.09, translucency: 1, spectral: 0.25, paleWarmth: 1,
    cornerRadius: 0.21, cutWidth: 0.07, roughness: 1, reflectance: 0.75, edge: 0.91,
    grainScale: 1400, grainAmount: 0.5,
    opticalThickness: 0.85, attenuationDistance: 2.05, filmDepth: 2, dispersion: 3,
    seamSpeed: 1.2, hotspotFocus: 0.8, hotspotIntensity: 0.8, beamWidth: 2,
    halo: 0, core: 0.67, cutLight: 0.14, innerWallGlow: 0.72, spill: 0.21, bodyLight: 0.23,
    diffusion: 0.15, absorption: 0, falloff: 0.8,
  },
  intelligence: {
    ...DEFAULT_SETTINGS.intelligence,
    mode: 'thinking', style: 'currents', activity: 0.25, flowSpeed: 0.1, impulse: 0.4,
  },
} as const satisfies Pick<MonolithSettings, 'material' | 'intelligence'>;

// Shared by the app embed and Studio so their starting material and intelligence values cannot drift.
export const MONOLITH_ORB_STATES = {
  rest: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.2, flowSpeed: 0 },
    material: { ...REST_LIGHT, edge: EDGE_ILLUMINATION, softCorners: true },
  },
  landing: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.2, flowSpeed: 0.18 },
    material: { halo: 0.08, core: 0.8, edge: ACTIVE_EDGE_ILLUMINATION, softCorners: true, bodyLight: 0.4 },
  },
  working: {
    intelligence: { mode: 'thinking', style: 'currents', activity: 0.6, flowSpeed: 0.18 },
    material: { halo: 0.08, core: 1, edge: ACTIVE_EDGE_ILLUMINATION, softCorners: true, bodyLight: 0.4 },
  },
  restLight: WEB_LIGHT_DEFAULT,
  landingLight: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.3, flowSpeed: 0.18 },
    material: ACTIVE_LIGHT,
  },
  workingLight: {
    intelligence: { mode: 'thinking', style: 'currents', activity: 0.7, flowSpeed: 0.18 },
    material: ACTIVE_LIGHT,
  },
} as const satisfies Record<string, MonolithState>;

export type MonolithOrbMood = 'rest' | 'landing' | 'working';

export function monolithOrbState(mood: MonolithOrbMood, appearance: 'dark' | 'light'): keyof typeof MONOLITH_ORB_STATES {
  return appearance === 'light' ? `${mood}Light` : mood;
}
