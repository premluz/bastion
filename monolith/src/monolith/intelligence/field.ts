import { add, scale, sub, type Vec3 } from '../geometry/vec';
import { smootherstep } from '../assembly/timeline';
import { hash1, valueNoise } from './hash';
import type { JunctionMap } from './junctions';
import { resolveLook, type Look } from './look';
import type { IntelligenceMode, MotionStyle } from './styles';

export type { IntelligenceMode, MotionStyle } from './styles';

export interface IntelligenceParams {
  /** 0 = barely present, 1 = highly active. */
  readonly activity: number;
  /** 0 = near-still, 1 = brisk redistribution. */
  readonly flowSpeed: number;
  readonly impulse: number;
  readonly mode: IntelligenceMode;
  readonly style: MotionStyle;
}

/** Must match the shader's MAX_MOTES. */
export const MAX_MOTES = 3;

export interface Mote {
  readonly position: Vec3;
  readonly strength: number;
}

export interface IntelligenceField {
  readonly motes: readonly Mote[];
  /** Calm energy present everywhere in the cuts. */
  readonly base: number;
  /** Standing concentration at the core junction. */
  readonly coreGlow: number;
  /** An impulse expanding from the core: front radius and strength. */
  readonly impulseRadius: number;
  readonly impulseStrength: number;
  /** Pausable time for the organic plasma; integrates the tempo of mode and style. */
  readonly drift: number;
  /** Plasma advection direction × speed, and how far forms are drawn out along it. */
  readonly flow: Vec3;
  readonly stretch: number;
  readonly plasmaScale: number;
  readonly contrast: number;
  readonly moteSpread: number;
  /** Multiplier on exterior spill. */
  readonly exterior: number;
  /** Flowing surface light. */
  readonly veil: number;
  /** How incandescent the body is, eased between glow characters. */
  readonly incandescence: number;
}

const IMPULSE_LIFE = 7;
const IMPULSE_SPEED = 0.35;

/** Hops between junctions per second of real time; the caller integrates this into the flow clock. */
export function flowRate(params: IntelligenceParams, look: Look = resolveLook(params)): number {
  return (0.03 + 0.45 * params.flowSpeed) * look.tempo * look.styleTempo;
}

function junctionAt(map: JunctionMap, mote: number, hop: number): Vec3 {
  const list = map.junctions;
  const index = Math.floor(hash1(mote * 131.7 + hop * 17.31) * list.length);
  const previous = Math.floor(hash1(mote * 131.7 + (hop - 1) * 17.31) * list.length);
  const pick = index === previous ? (index + 1) % list.length : index;
  return list[pick] ?? map.core;
}

function moteAt(map: JunctionMap, k: number, flowClock: number, gain: number): Mote {
  const pace = 0.8 + 0.4 * hash1(k * 9.13);
  const t = flowClock * pace + hash1(k * 3.7) * 10;
  const hop = Math.floor(t);
  const from = junctionAt(map, k, hop);
  const to = junctionAt(map, k, hop + 1);
  const position = add(from, scale(sub(to, from), smootherstep(t - hop)));
  // Shaped noise keeps most motes quiet most of the time, so one or two dominate at once.
  const presence = smootherstep((valueNoise(flowClock * 0.55 + k * 7.31) - 0.4) / 0.55);
  return { position, strength: gain * presence };
}

function impulseAt(eventClock: number, character: Pick<Look, 'impulseWindow' | 'impulseChance'>, strength: number): { radius: number; strength: number } {
  const window = character.impulseWindow;
  if (window <= 0 || strength <= 0) return { radius: 0, strength: 0 };
  const current = Math.floor(eventClock / window);
  let best = { radius: 0, strength: 0 };
  for (const i of [current - 1, current]) {
    if (hash1(i * 0.731 + 5.1) > character.impulseChance) continue;
    const start = i * window + hash1(i * 3.17 + 1.7) * window * 0.6;
    const age = eventClock - start;
    if (age < 0 || age > IMPULSE_LIFE) continue;
    // A gentle swell and a long fade — never a snap.
    const envelope = smootherstep(age / 2) * Math.exp(-Math.max(0, age - 2) * 0.6);
    if (strength * envelope > best.strength) best = { radius: age * IMPULSE_SPEED, strength: strength * envelope };
  }
  return best;
}

/** The whole field is a pure function of its two clocks, so it is frame-rate independent and pausable. */
export function intelligenceField(
  map: JunctionMap,
  flowClock: number,
  eventClock: number,
  params: IntelligenceParams,
  look: Look = resolveLook(params),
): IntelligenceField {
  const gain = look.motes * look.moteGain * (0.35 + 1.65 * params.activity);
  const motes = Array.from({ length: MAX_MOTES }, (_, k) => moteAt(map, k, flowClock, gain));
  const impulse = impulseAt(eventClock, look, params.impulse * 1.6);
  return {
    motes,
    base: look.base,
    coreGlow: 0.25 + 0.35 * params.activity,
    impulseRadius: impulse.radius,
    impulseStrength: impulse.strength,
    drift: flowClock * 2.5 + eventClock * 0.04,
    flow: look.flow,
    stretch: look.stretch,
    plasmaScale: look.scale,
    contrast: look.contrast,
    moteSpread: look.moteSpread,
    exterior: look.exterior * (0.5 + params.activity),
    veil: look.veil * (0.4 + 1.2 * params.activity),
    incandescence: look.incandescence,
  };
}
