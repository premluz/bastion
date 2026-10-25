import { smootherstep, window01 } from '../../monolith/assembly/timeline';
import { add, scale, type Vec3 } from '../../monolith/geometry/vec';
import { aboutPivot, IDENTITY_QUAT, quatFromAxisAngle, quatMultiply, type Quat, type Rigid } from './rigid';
import type { Window } from './fractalTimeline';

/** A quarter turn the unit has to undo on its way to the right orientation. */
export interface Turn {
  readonly axis: Vec3;
  readonly angle: number;
}

/**
 * One unit — a piece, or a whole finished cube — finding its place. It starts out along `direction`,
 * turned away by `turns`. It undoes them one at a time; after each wrong orientation it pauses and
 * probes towards its slot (a short approach and retreat), as if testing the fit. Once the orientation
 * is right it slides straight in, without rotating, so it never twists into its neighbours.
 */
export interface SearchMotion {
  readonly pivot: Vec3;
  readonly direction: Vec3;
  readonly distance: number;
  readonly turns: readonly Turn[];
  readonly window: Window;
  /** Phase of the gentle dormant drift, 0–1. */
  readonly drift: number;
}

/** Share of the unit's window spent searching; the rest is the final slide. */
const SEARCH_SHARE = 0.72;
/** Within each search step, the share spent holding still after the turn. */
const HOLD_SHARE = 0.5;
/** How much closer the unit gets while searching, as a share of its starting distance. */
const APPROACH = 0.42;
/** Depth of a probe towards the slot, as a share of the starting distance. */
const PROBE = 0.17;
const DRIFT_AMPLITUDE = 0.025;
const DRIFT_RATE = 2.5;

function remaining(turns: readonly Turn[], from: number): Quat {
  return turns.slice(from).reduce<Quat>((q, turn) => quatMultiply(q, quatFromAxisAngle(turn.axis, turn.angle)), IDENTITY_QUAT);
}

interface SearchState {
  readonly rotation: Quat;
  readonly probe: number;
  readonly searched: number;
}

function searchState(turns: readonly Turn[], u: number): SearchState {
  const searched = Math.min(1, u / SEARCH_SHARE);
  if (turns.length === 0) return { rotation: IDENTITY_QUAT, probe: 0, searched };
  const scaled = searched * turns.length;
  const step = Math.min(turns.length - 1, Math.floor(scaled));
  const local = searched >= 1 ? 1 : scaled - step;
  const turnDone = smootherstep(local / (1 - HOLD_SHARE));
  const current = turns[step];
  if (current === undefined) throw new Error(`Search step ${step} is missing`);
  const rotation = quatMultiply(quatFromAxisAngle(current.axis, current.angle * (1 - turnDone)), remaining(turns, step + 1));
  const isWrong = step < turns.length - 1;
  const hold = (local - (1 - HOLD_SHARE)) / HOLD_SHARE;
  const probe = isWrong && hold > 0 && hold < 1 ? PROBE * Math.sin(Math.PI * hold) ** 2 : 0;
  return { rotation, probe, searched };
}

export interface UnitState {
  readonly rigid: Rigid;
  /** 1 while apart, 0 once seated. */
  readonly openness: number;
}

export function searchTransform(m: SearchMotion, progress: number): UnitState {
  const u = window01(progress, m.window.start, m.window.end);
  const { rotation, probe, searched } = searchState(m.turns, u);
  const slide = smootherstep(window01(u, SEARCH_SHARE, 1));
  const reach = (1 - APPROACH * smootherstep(searched) - probe) * (1 - slide);
  const waiting = 1 - smootherstep(u * 4);
  const bob = DRIFT_AMPLITUDE * waiting * Math.sin(2 * Math.PI * (progress * DRIFT_RATE + m.drift));
  const offset = add(scale(m.direction, m.distance * reach), [0, bob, 0]);
  return { rigid: aboutPivot(rotation, m.pivot, offset), openness: Math.min(1, reach) };
}
