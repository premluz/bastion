import type { Vec3 } from '../geometry/vec';

export type IntelligenceMode = 'dormant' | 'thinking' | 'awakening';

/** How the plasma inside the monolith moves. */
export type MotionStyle = 'drift' | 'currents' | 'convection' | 'synapse';

export interface ModeCharacter {
  readonly base: number;
  readonly motes: number;
  /** Tempo of all motion — plasma and travelling energy alike. */
  readonly tempo: number;
  /** Seconds per window in which at most one impulse may occur; 0 disables impulses. */
  readonly impulseWindow: number;
  readonly impulseChance: number;
  /** Multiplier on exterior spill: how much of the inner activity reaches the skin. */
  readonly exterior: number;
  /** Flowing light across the whole surface, independent of the cuts. */
  readonly veil: number;
  /** How strongly the plasma modulates the light (0 = even, 1 = deep swings). */
  readonly contrast: number;
}

/** Thinking is the most engaged state; awakening is calmer but carries the strongest impulses. */
export const MODES: Record<IntelligenceMode, ModeCharacter> = {
  dormant: { base: 0.24, motes: 0.15, tempo: 0.25, impulseWindow: 0, impulseChance: 0, exterior: 0.5, veil: 0.04, contrast: 0.3 },
  thinking: { base: 0.46, motes: 2, tempo: 2.6, impulseWindow: 14, impulseChance: 0.6, exterior: 3.2, veil: 1.1, contrast: 1 },
  awakening: { base: 0.38, motes: 1.1, tempo: 1.1, impulseWindow: 7, impulseChance: 0.9, exterior: 1.3, veil: 0.25, contrast: 0.6 },
};

export interface StyleCharacter {
  readonly tempo: number;
  /** Advection of the plasma per unit of drift time, in world units. */
  readonly flow: Vec3;
  /** 0 = round forms, 1 = forms drawn out into streams along the flow. */
  readonly stretch: number;
  /** Plasma frequency in world units; higher = smaller, busier forms. */
  readonly scale: number;
  /** Gaussian spread of each travelling concentration. */
  readonly moteSpread: number;
  readonly moteGain: number;
}

export const STYLES: Record<MotionStyle, StyleCharacter> = {
  drift: { tempo: 1, flow: [0, 0.12, 0], stretch: 0, scale: 0.5, moteSpread: 0.16, moteGain: 1 },
  currents: { tempo: 1.5, flow: [0.55, 0.1, 0.3], stretch: 0.65, scale: 0.55, moteSpread: 0.14, moteGain: 1 },
  convection: { tempo: 1.1, flow: [0, 0.7, 0], stretch: 0.35, scale: 0.6, moteSpread: 0.18, moteGain: 0.9 },
  synapse: { tempo: 2, flow: [0, 0, 0], stretch: 0, scale: 0.85, moteSpread: 0.07, moteGain: 1.6 },
};

export const STYLE_LABELS: Record<MotionStyle, string> = {
  drift: 'Drift',
  currents: 'Currents',
  convection: 'Convection',
  synapse: 'Synapse',
};
