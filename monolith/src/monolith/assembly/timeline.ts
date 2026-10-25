/**
 * Every assembly state is a pure function of progress ∈ [0, 1], so scrubbing,
 * reversing and replaying never depend on previous frames.
 */
export const PHASE = {
  activationStart: 0.08,
  activationEnd: 0.28,
  alignStart: 0.22,
  alignEnd: 0.86,
  lockEnd: 0.97,
} as const;

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/** Quintic smootherstep: zero velocity and acceleration at both ends — no overshoot, no bounce. */
export const smootherstep = (t: number): number => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

export const window01 = (t: number, start: number, end: number): number => clamp01((t - start) / (end - start));

export interface LightState {
  /** Overall internal luminosity, 0 = dormant, 1 = living stillness. */
  readonly glow: number;
  /** Multiplier on the optical diffusion radius; >1 while the light is still unfocused. */
  readonly diffusionScale: number;
  /** Radius around the core inside which the cuts are lit — activation grows from the inside out. */
  readonly reveal: number;
  /** How strongly energy collects at the core junction (rises as the structure converges). */
  readonly coreEmphasis: number;
}

// The light grows from the core slowly and continuously, with no travelling fronts or flashes:
// motion is calm, deliberate, inevitable.
/** The inner light never goes out: dormant and apart, the monolith still holds this ember. */
const EMBER = 0.45;
const REVEAL_FROM = -0.35;
const REVEAL_TO = 3.6;
const REVEAL = { start: PHASE.activationStart, end: 0.55 } as const;

export function lightState(progress: number): LightState {
  const t = clamp01(progress);
  const activation = smootherstep(window01(t, PHASE.activationStart, PHASE.activationEnd));
  const convergence = smootherstep(window01(t, PHASE.alignStart, PHASE.alignEnd));
  const lock = smootherstep(window01(t, PHASE.alignEnd, PHASE.lockEnd));
  const reveal = smootherstep(window01(t, REVEAL.start, REVEAL.end));
  return {
    glow: EMBER + (1 - EMBER) * activation * (0.45 + 0.35 * convergence + 0.2 * lock),
    diffusionScale: 1 + 0.3 * (1 - convergence),
    reveal: REVEAL_FROM + (REVEAL_TO - REVEAL_FROM) * reveal,
    coreEmphasis: 0.4 + 0.6 * convergence,
  };
}

const PHASE_NAMES: readonly (readonly [number, string])[] = [
  [PHASE.lockEnd, 'Stillness'],
  [PHASE.alignEnd, 'Lock'],
  [0.62, 'Convergence'],
  [PHASE.alignStart, 'Alignment'],
  [PHASE.activationStart, 'Activation'],
];

export function phaseName(progress: number): string {
  return PHASE_NAMES.find(([start]) => progress >= start)?.[1] ?? 'Dormant';
}
