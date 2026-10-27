import type { MonolithState } from '@bastion/monolith';

// What the light-ground moods share: the inner light at full, and seen through amber glass rather than scattering to peach-white.
const LIGHT_GROUND = { core: 1, cutLight: 0.95, spill: 0.3, diffusion: 0.35, bodyLight: 0.75, softCorners: true, paleWarmth: 1 } as const;

// The orb's moods, as data on the monolith's own state mechanism. Resting still has an engaged
// intelligence (thinking, slow convection): an icon that sits in the navigation should read as alive,
// not as dormant. Working turns the same light up and across, never faster than it can be followed.
export const MONOLITH_ORB_STATES = {
  // In the navigation slot, beside the phone's edge: a quiet glow that is not cut by it.
  rest: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.2, flowSpeed: 0.25 },
    material: { halo: 0.15, core: 0.8, softCorners: true, bodyLight: 0.4 },
  },
  // On the assistant's landing, with room around it: the fuller glow.
  landing: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.2, flowSpeed: 0.25 },
    material: { halo: 0.35, core: 0.8, softCorners: true, bodyLight: 0.4 },
  },
  working: {
    intelligence: { mode: 'thinking', style: 'currents', activity: 0.6, flowSpeed: 0.55 },
    material: { halo: 0.3, core: 1, softCorners: true, bodyLight: 0.4 },
  },
  // On a pale ground the same moods run hotter (2026-10-27, direct feedback: the cube read faint beside dark mode's, and
  // should match the light Explore button's strength and tone): more light from within and through the cuts, a fuller halo.
  // At rest the body keeps its light colour, with glows travelling across it rather than lit through (2026-10-27, direct feedback).
  restLight: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.3, flowSpeed: 0.25 },
    material: { ...LIGHT_GROUND, core: 0.8, bodyLight: 0, spill: 0.1, paleWarmth: 0.6, halo: 0.35 },
  },
  landingLight: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.3, flowSpeed: 0.25 },
    material: { ...LIGHT_GROUND, halo: 0.6 },
  },
  workingLight: {
    intelligence: { mode: 'thinking', style: 'currents', activity: 0.7, flowSpeed: 0.55 },
    material: { ...LIGHT_GROUND, halo: 0.6 },
  },
} as const satisfies Record<string, MonolithState>;

export type MonolithOrbMood = 'rest' | 'landing' | 'working';

/** The state key for a mood on the current ground. */
export function monolithOrbState(mood: MonolithOrbMood, appearance: 'dark' | 'light'): keyof typeof MONOLITH_ORB_STATES {
  return appearance === 'light' ? `${mood}Light` : mood;
}
