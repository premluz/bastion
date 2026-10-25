import { describe, expect, it } from 'vitest';
import { length, sub } from '../monolith/geometry/vec';
import { FRACTAL_PHASE, cubePhaseName } from './assembly/fractalTimeline';
import { fractalMotions, pieceWorld } from './assembly/fractalMotion';
import { applyRigid, quatAngle } from './assembly/rigid';
import { buildCube } from './geometry/buildFractal';
import { CUBE_COUNT } from './geometry/cubeLayout';
import { cellVolume } from './geometry/splitPlanes';

const BASE = { seed: 7, count: 12, cutWidth: 0.034, bevel: 0.008 };

describe('single cube', () => {
  it.each([7, 23])('breaks into exactly the requested number of elements (seed %i)', (seed) => {
    for (let count = CUBE_COUNT.min; count <= CUBE_COUNT.max; count += 1) {
      expect(buildCube({ ...BASE, seed, count }).pieces.length).toBe(count);
    }
  });

  it('rejects counts outside the knob range', () => {
    expect(() => buildCube({ ...BASE, count: 1 })).toThrow(/2–48/);
    expect(() => buildCube({ ...BASE, count: 49 })).toThrow(/2–48/);
  });

  it('keeps elements even: the largest is at most a few times the smallest', () => {
    const volumes = buildCube({ ...BASE, count: 24 }).pieces.map((p) => cellVolume(p.model.cells[0] ?? []));
    expect(Math.max(...volumes) / Math.min(...volumes)).toBeLessThan(6);
    expect(volumes.reduce((a, b) => a + b, 0)).toBeGreaterThan(7);
  });

  it('is one cube: no fractal levels, no agent', () => {
    const model = buildCube(BASE);
    expect(model.pieces.every((p) => p.level === 0)).toBe(true);
    expect(model.agentCore).toBeNull();
  });

  it('searches, seats exactly at lock and stays in place without deploying', () => {
    const model = buildCube({ ...BASE, count: 20 });
    const motion = fractalMotions(model, { trials: 2, seed: 7 });
    expect(motion.agentPivot).toBeNull();
    model.pieces.forEach((piece, i) => {
      const c = piece.model.centroid;
      const start = pieceWorld(motion, i, 0).rigid;
      expect(length(sub(applyRigid(start, c), c))).toBeGreaterThan(0.1);
      for (const t of [FRACTAL_PHASE.lockEnd, 1]) {
        const at = pieceWorld(motion, i, t).rigid;
        expect(length(sub(applyRigid(at, c), c))).toBeLessThan(1e-9);
        expect(at.scale).toBe(1);
        expect(quatAngle(at.rotation)).toBeLessThan(1e-9);
      }
    });
  });

  it('names its phases without a deploy', () => {
    expect(cubePhaseName(0)).toBe('Dormant');
    expect(cubePhaseName(0.3)).toBe('Search');
    expect(cubePhaseName(0.8)).toBe('Lock');
    expect(cubePhaseName(0.9)).toBe('Stillness');
  });
});
