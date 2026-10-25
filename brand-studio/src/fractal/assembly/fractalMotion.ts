import { length, normalize, scale, sub, type Vec3 } from '../../monolith/geometry/vec';
import { hash1 } from '../../monolith/intelligence/hash';
import type { FractalModel } from '../geometry/buildFractal';
import type { LevelFrame } from '../geometry/fractalLayout';
import { deployProgress, stageWindow, type Window } from './fractalTimeline';
import { aboutPivot, compose, IDENTITY, quatFromAxisAngle, type Rigid } from './rigid';
import { searchTransform, type SearchMotion, type Turn, type UnitState } from './searchMotion';

export interface MotionSettings {
  /** Wrong orientations each unit tries before the right one (0–3). */
  readonly trials: number;
  readonly seed: number;
}

export interface FractalMotion {
  readonly pieces: readonly { readonly level: number; readonly motion: SearchMotion }[];
  /** Index = fractal level; level 0 has no group motion of its own. */
  readonly groups: readonly (SearchMotion | null)[];
  /** The deployable cube's centre; null for a single cube, which deploys nothing. */
  readonly agentPivot: Vec3 | null;
}

/** Dormant separation in units of the parent cube's half-size. */
// Group offsets add to their pieces' own, so both stay modest to keep the cloud in frame.
const PIECE_SPREAD = 0.72;
const GROUP_SPREAD = 0.8;
/** Units of one stage start spread over this share of it. */
const STAGGER = 0.38;
const SIGNED_AXES: readonly Vec3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]];

/** The agent's resting place beside the monolith, and how much the whole scene shifts to frame both. */
const SCREEN_RIGHT: Vec3 = normalize([1, 0, -1]);
const AGENT_REACH = scale(SCREEN_RIGHT, 2.2);
const AGENT_TARGET: Vec3 = [AGENT_REACH[0], -0.25, AGENT_REACH[2]];
const SCENE_SHIFT = 1.2;
const AGENT_SCALE = 1.3;
const AGENT_LIFT = 0.55;

function frameOf(frames: readonly LevelFrame[], level: number): LevelFrame {
  const frame = frames.find((f) => f.level === level);
  if (frame === undefined) throw new Error(`No frame for fractal level ${level}`);
  return frame;
}

function turnsFor(key: number, settings: MotionSettings): Turn[] {
  const fewer = hash1(key * 3.1 + settings.seed) < 0.35 ? 1 : 0;
  const wrong = Math.max(0, Math.min(3, settings.trials - fewer));
  const turns: Turn[] = [];
  let previous = -1;
  for (let i = 0; i <= wrong; i += 1) {
    let pick = Math.floor(hash1(key * 11.7 + i * 5.3 + settings.seed) * SIGNED_AXES.length);
    if (pick % 3 === previous % 3) pick = (pick + 1) % SIGNED_AXES.length;
    previous = pick;
    turns.push({ axis: SIGNED_AXES[pick] ?? [0, 1, 0], angle: Math.PI / 2 });
  }
  return turns;
}

function unit(key: number, pivot: Vec3, from: Vec3, distance: number, window: Window, settings: MotionSettings): SearchMotion {
  const away = sub(pivot, from);
  const direction = length(away) < 1e-3 ? normalize([1, 1, 1]) : normalize(away);
  return { pivot, direction, distance, turns: turnsFor(key, settings), window, drift: hash1(key * 0.37 + 2.9) };
}

function staggered(stage: Window, order: number): Window {
  const span = stage.end - stage.start;
  const start = stage.start + order * span * STAGGER;
  return { start, end: start + span * (1 - STAGGER) };
}

export function fractalMotions(model: FractalModel, settings: MotionSettings): FractalMotion {
  const deepest = Math.max(...model.frames.map((f) => f.level));
  const stages = deepest + 1;
  const pieces = model.pieces.map((piece, index) => {
    const frame = frameOf(model.frames, piece.level);
    const stage = stageWindow(deepest - piece.level, stages);
    const order = hash1(index * 1.91 + settings.seed * 0.7);
    const motion = unit(index + 1, piece.model.centroid, frame.center, PIECE_SPREAD * frame.half, staggered(stage, order), settings);
    return { level: piece.level, motion };
  });
  const groups = model.frames
    .slice()
    .sort((a, b) => a.level - b.level)
    .map((frame) => {
      if (frame.level === 0) return null;
      const parent = frameOf(model.frames, frame.level - 1);
      const stage = stageWindow(deepest - frame.level + 1, stages);
      // A whole cube is heavier and surer: one fewer wrong attempt, so each of its turns is unhurried.
      const decisive = { ...settings, trials: Math.max(0, settings.trials - 1) };
      return unit(1000 + frame.level, frame.center, parent.center, GROUP_SPREAD * parent.half, staggered(stage, 0.15), decisive);
    });
  const agent = model.frames.find((f) => f.level === 1);
  return { pieces, groups, agentPivot: agent === undefined ? null : agent.center };
}

/** The agent leaves its corner on an arc, turns once and grows into its own cube beside the monolith. */
function deployTransform(agentPivot: Vec3, progress: number): Rigid {
  const d = deployProgress(progress);
  if (d <= 0) return IDENTITY;
  const lift = AGENT_LIFT * Math.sin(Math.PI * d);
  const target = sub(AGENT_TARGET, agentPivot);
  const offset: Vec3 = [target[0] * d, target[1] * d + lift, target[2] * d];
  return aboutPivot(quatFromAxisAngle([0, 1, 0], (Math.PI / 2) * d), agentPivot, offset, 1 + (AGENT_SCALE - 1) * d);
}

export function pieceWorld(motion: FractalMotion, index: number, progress: number): UnitState {
  const entry = motion.pieces[index];
  if (entry === undefined) throw new Error(`No motion for fractal piece ${index}`);
  const own = searchTransform(entry.motion, progress);
  let rigid = own.rigid;
  for (let level = entry.level; level >= 1; level -= 1) {
    const group = motion.groups[level];
    if (group !== null && group !== undefined) rigid = compose(searchTransform(group, progress).rigid, rigid);
  }
  if (motion.agentPivot === null) return { rigid, openness: own.openness };
  if (entry.level >= 1) rigid = compose(deployTransform(motion.agentPivot, progress), rigid);
  const shift: Rigid = { ...IDENTITY, translation: scale(SCREEN_RIGHT, -SCENE_SHIFT * deployProgress(progress)) };
  return { rigid: compose(shift, rigid), openness: own.openness };
}
