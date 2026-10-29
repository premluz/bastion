import { DEFAULT_SETTINGS, type MonolithState } from '@bastion/monolith';

// Preserve the resting pale finish separately from the active optical treatment.
const EDGE_ILLUMINATION = 0.3;
const ACTIVE_EDGE_ILLUMINATION = 0.6;
const LIGHT_GROUND = { core: 1, cutLight: 0.95, spill: 0.3, diffusion: 0.35, bodyLight: 0.75, edge: EDGE_ILLUMINATION, softCorners: true, paleWarmth: 0.35 } as const;
const REST_LIGHT = { halo: 0, core: DEFAULT_SETTINGS.material.core, cutLight: DEFAULT_SETTINGS.material.cutLight,
  spill: 0, bodyLight: 0 } as const;
// Keep activation concentrated in the cuts; a thin, low-transmission shell stays visibly white.
const ACTIVE_LIGHT = { ...LIGHT_GROUND, halo: 0.04, core: 0.85, spill: 0.04, diffusion: 0.15,
  bodyLight: 0.06, edge: ACTIVE_EDGE_ILLUMINATION, paleWarmth: 0, translucency: 0.12, opticalThickness: 0.45, spectral: 0.15 } as const;

// Rest keeps light in the seams; working reveals more of the same source without changing the structure.
export const MONOLITH_ORB_STATES = {
  // In the navigation slot, a contained seam ember reads against the dark page.
  rest: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.2, flowSpeed: 0 },
    material: { ...REST_LIGHT, edge: EDGE_ILLUMINATION, softCorners: true },
  },
  // On the assistant's landing, with room around it: the fuller glow.
  landing: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.2, flowSpeed: 0.18 },
    material: { halo: 0.08, core: 0.8, edge: ACTIVE_EDGE_ILLUMINATION, softCorners: true, bodyLight: 0.4 },
  },
  working: {
    intelligence: { mode: 'thinking', style: 'currents', activity: 0.6, flowSpeed: 0.18 },
    material: { halo: 0.08, core: 1, edge: ACTIVE_EDGE_ILLUMINATION, softCorners: true, bodyLight: 0.4 },
  },
  // Rest retains the existing pale finish; activation reveals orange seams without tinting the whole body pink.
  restLight: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.3, flowSpeed: 0 },
    material: { ...LIGHT_GROUND, paleWarmth: 0.6, ...REST_LIGHT, edge: LIGHT_GROUND.edge },
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

/** The state key for a mood on the current ground. */
export function monolithOrbState(mood: MonolithOrbMood, appearance: 'dark' | 'light'): keyof typeof MONOLITH_ORB_STATES {
  return appearance === 'light' ? `${mood}Light` : mood;
}
