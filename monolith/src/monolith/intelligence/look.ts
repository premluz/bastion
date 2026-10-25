import type { Vec3 } from '../geometry/vec';
import { damp } from './damp';
import type { IntelligenceMode, MotionStyle } from './styles';
import { MODES, STYLES } from './styles';

/**
 * Everything about how the intelligence looks that a control can change — resolved to plain numbers
 * so it can be eased. Changing mode, style or glow character moves these gradually; nothing snaps.
 */
export interface Look {
  readonly base: number;
  readonly motes: number;
  /** Tempo of the mode; multiplies the style's. */
  readonly tempo: number;
  readonly exterior: number;
  readonly veil: number;
  readonly contrast: number;
  readonly styleTempo: number;
  readonly flow: Vec3;
  readonly stretch: number;
  readonly scale: number;
  readonly moteSpread: number;
  readonly moteGain: number;
  /** 0 = contained, up to 1 = fully incandescent. */
  readonly incandescence: number;
  /** Discrete: which impulse events exist. These switch at once; each event has its own gentle envelope. */
  readonly impulseWindow: number;
  readonly impulseChance: number;
}

export interface LookTarget {
  readonly mode: IntelligenceMode;
  readonly style: MotionStyle;
}

export function resolveLook(target: LookTarget, incandescence = 0): Look {
  const mode = MODES[target.mode];
  const style = STYLES[target.style];
  return {
    base: mode.base,
    motes: mode.motes,
    tempo: mode.tempo,
    exterior: mode.exterior,
    veil: mode.veil,
    contrast: mode.contrast,
    styleTempo: style.tempo,
    flow: style.flow,
    stretch: style.stretch,
    scale: style.scale,
    moteSpread: style.moteSpread,
    moteGain: style.moteGain,
    incandescence,
    impulseWindow: mode.impulseWindow,
    impulseChance: mode.impulseChance,
  };
}

/** Calm: ~95% of the way in 1.2 s. */
export const LOOK_RATE = 2.5;

export function approachLook(current: Look, target: Look, deltaSeconds: number): Look {
  const to = (a: number, b: number): number => damp(a, b, LOOK_RATE, deltaSeconds);
  return {
    base: to(current.base, target.base),
    motes: to(current.motes, target.motes),
    tempo: to(current.tempo, target.tempo),
    exterior: to(current.exterior, target.exterior),
    veil: to(current.veil, target.veil),
    contrast: to(current.contrast, target.contrast),
    styleTempo: to(current.styleTempo, target.styleTempo),
    flow: [to(current.flow[0], target.flow[0]), to(current.flow[1], target.flow[1]), to(current.flow[2], target.flow[2])],
    stretch: to(current.stretch, target.stretch),
    scale: to(current.scale, target.scale),
    moteSpread: to(current.moteSpread, target.moteSpread),
    moteGain: to(current.moteGain, target.moteGain),
    incandescence: to(current.incandescence, target.incandescence),
    impulseWindow: target.impulseWindow,
    impulseChance: target.impulseChance,
  };
}
