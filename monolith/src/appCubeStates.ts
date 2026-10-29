import { DEFAULT_SETTINGS } from './settings';
import type { MonolithState } from './states';

const EDGE_ILLUMINATION = 0.3;
const ACTIVE_EDGE_ILLUMINATION = 0.6;
const LIGHT_CUT_ILLUMINATION = 1;
const LIGHT_CUT_WIDTH = 0.06;
const LIGHT_BEAM_WIDTH = LIGHT_CUT_WIDTH / DEFAULT_SETTINGS.material.cutWidth;
const REST_LIGHT_SPILL = 0.025;
const LIGHT_GROUND = { family: 'current', core: 1, cutLight: LIGHT_CUT_ILLUMINATION, cutWidth: LIGHT_CUT_WIDTH, beamWidth: LIGHT_BEAM_WIDTH, spill: 0.3, diffusion: 0.35, bodyLight: 0.75, edge: EDGE_ILLUMINATION, softCorners: true, paleWarmth: 0.35 } as const;
const REST_LIGHT = { halo: 0, core: DEFAULT_SETTINGS.material.core, cutLight: DEFAULT_SETTINGS.material.cutLight,
  spill: 0, bodyLight: 0 } as const;
const ACTIVE_LIGHT = { ...LIGHT_GROUND, halo: 0.04, core: 0.85, spill: 0.04, diffusion: 0.15,
  bodyLight: 0.06, edge: ACTIVE_EDGE_ILLUMINATION, paleWarmth: 0, translucency: 0.12, opticalThickness: 0.45, spectral: 0.15 } as const;

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
  restLight: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.3, flowSpeed: 0 },
    material: { ...LIGHT_GROUND, paleWarmth: 0.6, ...REST_LIGHT, cutLight: LIGHT_CUT_ILLUMINATION,
      spill: REST_LIGHT_SPILL, diffusion: ACTIVE_LIGHT.diffusion, edge: LIGHT_GROUND.edge },
  },
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
