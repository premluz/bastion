import type { MonolithState } from '@bastion/monolith';

// The orb's moods, as data on the monolith's own state mechanism. Resting still has an engaged
// intelligence (thinking, slow convection): an icon that sits in the navigation should read as alive,
// not as dormant. Working turns the same light up and across, never faster than it can be followed.
export const MONOLITH_ORB_STATES = {
  // In the navigation slot, beside the phone's edge: a quiet glow that is not cut by it.
  rest: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.2, flowSpeed: 0.25 },
    material: { halo: 0.15, core: 0.8 },
  },
  // On the assistant's landing, with room around it: the fuller glow.
  landing: {
    intelligence: { mode: 'thinking', style: 'convection', activity: 0.2, flowSpeed: 0.25 },
    material: { halo: 0.35, core: 0.8 },
  },
  working: {
    intelligence: { mode: 'thinking', style: 'currents', activity: 0.6, flowSpeed: 0.55 },
    material: { halo: 0.3, core: 1 },
  },
} as const satisfies Record<string, MonolithState>;

export type MonolithOrbMood = keyof typeof MONOLITH_ORB_STATES;
