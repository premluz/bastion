import { describe, expect, it } from 'vitest';
import { buildMonolith } from '../monolith/geometry/buildMonolith';
import { length, sub } from '../monolith/geometry/vec';
import { releaseThenAssemble } from '../monolith/assembly/shapeToShape';
import { VARIANTS } from '../monolith/variants';
import { fractalMotions, pieceWorld } from './assembly/fractalMotion';
import { applyRigid, quatAngle } from './assembly/rigid';
import { monolithCube } from './geometry/monolithCube';

const GEOMETRY = { cutWidth: 0.034, bevel: 0, round: 0 };
const SEARCH = { seed: 7, trials: 2 };
const MIN_TURN = Math.PI / 4;
const POSITION_TOLERANCE = 1e-9;

describe.each(VARIANTS)('$name Cube assembly', (variant) => {
  const original = buildMonolith(variant, GEOMETRY);
  const model = monolithCube(original);
  const motion = fractalMotions(model, SEARCH);

  it('preserves every monolith piece, cut and light source', () => {
    expect(model.pieces).toHaveLength(variant.pieces.length);
    model.pieces.forEach((piece, index) => expect(piece.model).toBe(original.pieces[index]));
    expect(model.junctions).toBe(original.junctions);
    expect(motion.agentPivot).toBeNull();
  });

  it('rotates each detached piece and returns exactly to the original geometry', () => {
    model.pieces.forEach((piece, index) => {
      const apart = pieceWorld(motion, index, releaseThenAssemble(0.3)).rigid;
      expect(quatAngle(apart.rotation)).toBeGreaterThan(MIN_TURN);
      expect(length(sub(applyRigid(apart, piece.model.centroid), piece.model.centroid))).toBeGreaterThan(0.1);
      for (const endpoint of [0, 1]) {
        const seated = pieceWorld(motion, index, releaseThenAssemble(endpoint)).rigid;
        expect(quatAngle(seated.rotation)).toBeLessThan(POSITION_TOLERANCE);
        for (const polygon of piece.model.outer) for (const point of polygon.points) {
          expect(length(sub(applyRigid(seated, point), point))).toBeLessThan(POSITION_TOLERANCE);
        }
      }
    });
  });
});
