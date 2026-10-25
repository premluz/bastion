import { describe, expect, it } from 'vitest';
import { dot, length, normalize, polygonAreaVector, sub, type Vec3 } from '../monolith/geometry/vec';
import type { Face } from '../monolith/geometry/convexCell';
import { MAX_OPENINGS } from '../monolith/limits';
import { FRACTAL_PHASE, stageWindow } from './assembly/fractalTimeline';
import { fractalMotions, pieceWorld } from './assembly/fractalMotion';
import { applyRigid, quatAngle } from './assembly/rigid';
import { searchTransform } from './assembly/searchMotion';
import { buildFractal } from './geometry/buildFractal';
import { CORNER_RATIO, type FractalParams } from './geometry/fractalLayout';
import { cellVolume } from './geometry/splitPlanes';

const BASE: FractalParams = { seed: 7, levels: 2, granularity: 2, cutWidth: 0.034, bevel: 0.008 };
/** Deliberately different second shapes: one level and coarse, three levels and fine, another seed. */
const CASES: readonly FractalParams[] = [BASE, { ...BASE, levels: 1, granularity: 1, seed: 3 }, { ...BASE, levels: 3, granularity: 3, seed: 41 }];
const SETTINGS = { trials: 2, seed: 7 };

const points = (cell: readonly Face[]): Vec3[] => cell.flatMap((f) => [...f.points]);
const axes = (cell: readonly Face[]): Vec3[] => cell.map((f) => normalize(polygonAreaVector(f.points)));

function gap(a: readonly Face[], b: readonly Face[]): number {
  let best = -Infinity;
  for (const n of [...axes(a), ...axes(b)]) {
    const pa = points(a).map((p) => dot(n, p));
    const pb = points(b).map((p) => dot(n, p));
    best = Math.max(best, Math.min(...pb) - Math.max(...pa), Math.min(...pa) - Math.max(...pb));
  }
  return best;
}

describe.each(CASES.map((c) => [`seed ${c.seed}, ${c.levels} levels, granularity ${c.granularity}`, c] as const))('%s', (_n, params) => {
  const model = buildFractal(params);

  it('builds solid pieces that fill the cube apart from the slots', () => {
    const volume = model.pieces.reduce((v, p) => v + cellVolume(p.model.cells[0] ?? []), 0);
    expect(volume).toBeGreaterThan(6.8);
    expect(volume).toBeLessThan(8);
    for (const piece of model.pieces) {
      expect(piece.model.outer.length + piece.model.walls.length).toBeGreaterThan(3);
      expect(piece.model.openings.length).toBeLessThanOrEqual(MAX_OPENINGS);
    }
  });

  it('keeps every pair of pieces at least the narrowest slot apart (no interpenetration when assembled)', () => {
    const narrowest = params.cutWidth * CORNER_RATIO ** params.levels;
    model.pieces.forEach((a, i) =>
      model.pieces.slice(i + 1).forEach((b) => {
        expect(gap(a.model.cells[0] ?? [], b.model.cells[0] ?? [])).toBeGreaterThan(narrowest * 0.95);
      }),
    );
  });

  it('is self-similar: every level above the deepest has the same pattern', () => {
    const counts = Array.from({ length: params.levels }, (_, level) => model.pieces.filter((p) => p.level === level).length);
    expect(new Set(counts).size).toBe(1);
  });

  it('seats every piece exactly at lock, and nothing teleports along the way', () => {
    const motion = fractalMotions(model, SETTINGS);
    model.pieces.forEach((piece, i) => {
      const at = pieceWorld(motion, i, FRACTAL_PHASE.lockEnd);
      expect(length(sub(applyRigid(at.rigid, piece.model.centroid), piece.model.centroid))).toBeLessThan(1e-9);
      expect(at.openness).toBe(0);
      let previous = applyRigid(pieceWorld(motion, i, 0).rigid, piece.model.centroid);
      // Smooth motion moves at most a few hundredths per 1/4000 of the run; a jump would not shrink with the step.
      for (let s = 1; s <= 4000; s += 1) {
        const next = applyRigid(pieceWorld(motion, i, s / 4000).rigid, piece.model.centroid);
        expect(length(sub(next, previous))).toBeLessThan(0.02);
        previous = next;
      }
    });
  });
});

describe('intelligent assembly', () => {
  const model = buildFractal(BASE);
  const motion = fractalMotions(model, SETTINGS);

  it('starts every unit away from its place and turned at least a quarter, so each has to search', () => {
    model.pieces.forEach((piece, i) => {
      expect(length(sub(applyRigid(pieceWorld(motion, i, 0).rigid, piece.model.centroid), piece.model.centroid))).toBeGreaterThan(0.1);
    });
    const units = [...motion.pieces.map((p) => p.motion), ...motion.groups.flatMap((g) => (g === null ? [] : [g]))];
    for (const unit of units) expect(quatAngle(searchTransform(unit, 0).rigid.rotation)).toBeGreaterThan(Math.PI / 2 - 1e-6);
  });

  it('tries wrong orientations before the right one', () => {
    const unit = motion.pieces.find((p) => p.motion.turns.length >= 3)?.motion;
    if (unit === undefined) throw new Error('No unit with two or more trials');
    const span = unit.window.end - unit.window.start;
    const angles = [0.3, 0.5].map((share) => quatAngle(searchTransform(unit, unit.window.start + span * share).rigid.rotation));
    for (const angle of angles) expect(angle).toBeGreaterThan(Math.PI / 2 - 0.2);
    expect(quatAngle(searchTransform(unit, unit.window.end).rigid.rotation)).toBeLessThan(1e-9);
  });

  it('assembles from the smallest scale up', () => {
    const deepest = Math.max(...model.pieces.map((p) => p.level));
    expect(stageWindow(0, deepest + 1).end).toBeLessThan(stageWindow(deepest, deepest + 1).end);
    const endOf = (level: number): number => Math.max(...motion.pieces.filter((p) => p.level === level).map((p) => p.motion.window.end));
    expect(endOf(deepest)).toBeLessThan(endOf(0));
  });

  it('deploys the corner cube as a larger, independent agent and leaves the monolith upright', () => {
    const main = model.pieces.findIndex((p) => p.level === 0);
    const agent = model.pieces.findIndex((p) => p.level === 1);
    const atMain = pieceWorld(motion, main, 1).rigid;
    const atAgent = pieceWorld(motion, agent, 1).rigid;
    expect(atMain.scale).toBe(1);
    expect(quatAngle(atMain.rotation)).toBeLessThan(1e-9);
    expect(atAgent.scale).toBeGreaterThan(1.2);
    const agentPiece = model.pieces[agent]?.model.centroid ?? [0, 0, 0];
    expect(length(sub(applyRigid(atAgent, agentPiece), applyRigid(atMain, agentPiece)))).toBeGreaterThan(1.5);
  });

  it('is deterministic for a seed and changes with it', () => {
    const again = buildFractal(BASE).pieces.map((p) => p.model.centroid);
    expect(again).toEqual(model.pieces.map((p) => p.model.centroid));
    const other = buildFractal({ ...BASE, seed: 8 }).pieces.map((p) => p.model.centroid);
    expect(other).not.toEqual(again);
  });
});
