import { clamp01, lightState, smootherstep, window01, type LightState } from '../../monolith/assembly/timeline';

/**
 * The fractal sequence, a pure function of progress ∈ [0, 1]. Assembly runs from the smallest scale
 * up: the deepest corner cube gathers first, and each finished cube then searches for its place as a
 * single piece while the next level's pieces gather around it. After the lock, the level-1 cube leaves
 * as an independent agent.
 */
export const FRACTAL_PHASE = {
  searchStart: 0.06,
  assembleEnd: 0.78,
  lockEnd: 0.86,
  deployStart: 0.87,
  deployEnd: 0.97,
} as const;

/** Successive stages overlap by this share, so a level starts while the one below is settling. */
const STAGE_OVERLAP = 0.22;

export interface Window {
  readonly start: number;
  readonly end: number;
}

/** Stage 0 is the deepest level; the last stage is the whole monolith. */
export function stageWindow(stage: number, stages: number): Window {
  const span = FRACTAL_PHASE.assembleEnd - FRACTAL_PHASE.searchStart;
  const length = span / (stages - (stages - 1) * STAGE_OVERLAP);
  const start = FRACTAL_PHASE.searchStart + stage * length * (1 - STAGE_OVERLAP);
  return { start, end: start + length };
}

/** The monolith's light curve, reached at lock and held through the deploy. */
const ORIGINAL_LOCK_END = 0.97;
export function fractalLight(progress: number): LightState {
  const t = clamp01(progress);
  const mapped =
    t <= FRACTAL_PHASE.lockEnd
      ? (t / FRACTAL_PHASE.lockEnd) * ORIGINAL_LOCK_END
      : ORIGINAL_LOCK_END + ((t - FRACTAL_PHASE.lockEnd) / (1 - FRACTAL_PHASE.lockEnd)) * (1 - ORIGINAL_LOCK_END);
  return lightState(mapped);
}

/** Deploy progress, 0 assembled → 1 the agent stands on its own. */
export const deployProgress = (progress: number): number =>
  smootherstep(window01(progress, FRACTAL_PHASE.deployStart, FRACTAL_PHASE.deployEnd));

/** The agent's own first pulse: an impulse expanding from its junction once it lands. */
export function agentImpulse(progress: number): { radius: number; strength: number } {
  const u = window01(progress, FRACTAL_PHASE.deployEnd - 0.03, 1);
  if (u <= 0 || u >= 1) return { radius: 0, strength: 0 };
  return { radius: 1.4 * smootherstep(u), strength: 0.9 * (1 - u) ** 2 * smootherstep(u * 5) };
}

const NAMES: readonly (readonly [number, string])[] = [
  [FRACTAL_PHASE.deployEnd, 'Stillness'],
  [FRACTAL_PHASE.deployStart, 'Deploy'],
  [FRACTAL_PHASE.assembleEnd, 'Lock'],
  [0.5, 'Converge'],
  [FRACTAL_PHASE.searchStart, 'Search'],
];

export function fractalPhaseName(progress: number): string {
  return NAMES.find(([start]) => progress >= start)?.[1] ?? 'Dormant';
}

/** A single cube has no deploy: it rests from the end of the lock. */
export function cubePhaseName(progress: number): string {
  return progress >= FRACTAL_PHASE.lockEnd ? 'Stillness' : fractalPhaseName(progress);
}
