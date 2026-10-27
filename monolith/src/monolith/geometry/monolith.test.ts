import { describe, expect, it } from 'vitest';
import { applyTransform, pieceMotions, pieceTransform } from '../assembly/pieceMotion';
import { MAX_OPENINGS } from '../limits';
import { VARIANTS } from '../variants';
import { resolveBound } from './bounds';
import { buildMonolith } from './buildMonolith';
import type { Face } from './convexCell';
import { dot, normalize, polygonAreaVector, type Vec3 } from './vec';

const CUT_WIDTHS = [0.02, 0.035, 0.06];
const BEVEL = 0.008;

const vertices = (cell: readonly Face[]): Vec3[] => cell.flatMap((f) => [...f.points]);
const normals = (cell: readonly Face[]): Vec3[] => cell.map((f) => normalize(polygonAreaVector(f.points)));

/** Largest gap between two convex point sets along the candidate axes (negative = overlap). */
function separation(a: readonly Vec3[], b: readonly Vec3[], axes: readonly Vec3[]): number {
  let best = -Infinity;
  for (const n of axes) {
    const maxA = Math.max(...a.map((p) => dot(n, p)));
    const minA = Math.min(...a.map((p) => dot(n, p)));
    const maxB = Math.max(...b.map((p) => dot(n, p)));
    const minB = Math.min(...b.map((p) => dot(n, p)));
    best = Math.max(best, minB - maxA, minA - maxB);
  }
  return best;
}

const insideCell = (cell: readonly Face[], p: Vec3): boolean =>
  cell.every((f) => dot(f.plane.n, p) - f.plane.d <= 1e-9);

describe.each(VARIANTS.map((v) => [v.name, v] as const))('%s', (_name, variant) => {
  it.each(CUT_WIDTHS)('builds with every seam covered at cut width %f', (cutWidth) => {
    const model = buildMonolith(variant, { cutWidth, bevel: BEVEL });
    for (const piece of model.pieces) {
      expect(piece.outer.length).toBeGreaterThan(0);
      expect(piece.walls.length).toBeGreaterThan(0);
      expect(piece.openings.length).toBeGreaterThan(0);
      expect(piece.openings.length).toBeLessThanOrEqual(MAX_OPENINGS);
    }
  });

  it('keeps every pair of pieces exactly one cut width apart or more', () => {
    const cutWidth = 0.035;
    const model = buildMonolith(variant, { cutWidth, bevel: BEVEL });
    model.pieces.forEach((pa, i) =>
      model.pieces.slice(i + 1).forEach((pb) => {
        for (const ca of pa.cells) {
          for (const cb of pb.cells) {
            const gap = separation(vertices(ca), vertices(cb), [...normals(ca), ...normals(cb)]);
            expect(gap, `${pa.id} ↔ ${pb.id}`).toBeGreaterThanOrEqual(cutWidth - 1e-6);
          }
        }
      }),
    );
  });

  it('fills the whole cube apart from the slots', () => {
    const cutWidth = 0.035;
    const model = buildMonolith(variant, { cutWidth, bevel: BEVEL });
    const cutPlanes = variant.pieces.flatMap((p) => p.cells.flat()).filter((b) => b.mode === 'cut');
    let seed = 7;
    const random = (): number => {
      seed = (seed * 16807) % 2147483647;
      return (seed / 2147483647) * 1.9 - 0.95;
    };
    for (let i = 0; i < 4000; i += 1) {
      const p: Vec3 = [random(), random(), random()];
      const owners = model.pieces.filter((piece) => piece.cells.some((cell) => insideCell(cell, p)));
      expect(owners.length, `point ${p.join(', ')}`).toBeLessThanOrEqual(1);
      const nearSlot = cutPlanes.some((b) => Math.abs(dot(b.n, p) - resolveBound({ ...b, mode: 'free' }, 0).d) <= cutWidth / 2 + 1e-6);
      if (!nearSlot) expect(owners.length, `void at ${p.join(', ')}`).toBe(1);
    }
  });

  it('never interpenetrates while assembling', () => {
    const model = buildMonolith(variant, { cutWidth: 0.035, bevel: BEVEL });
    const motions = pieceMotions(model);
    for (let step = 0; step <= 100; step += 1) {
      const t = step / 100;
      const placed = model.pieces.map((piece, i) => {
        const motion = motions[i];
        if (motion === undefined) throw new Error('missing motion');
        const transform = pieceTransform(motion, t);
        return piece.cells.map((cell) => cell.map((f) => f.points.map((p) => applyTransform(transform, p))));
      });
      placed.forEach((cellsA, i) =>
        placed.slice(i + 1).forEach((cellsB) => {
          for (const a of cellsA) {
            for (const b of cellsB) {
              const axes = [...a, ...b].map((poly) => normalize(polygonAreaVector(poly)));
              expect(separation(a.flat(), b.flat(), axes), `t=${t}`).toBeGreaterThan(0);
            }
          }
        }),
      );
    }
  });
});

describe('soft corners', () => {
  it.each(VARIANTS.map((v) => [v.name, v] as const))('%s builds with rounded corners, every seam covered', (_name, variant) => {
    const model = buildMonolith(variant, { cutWidth: 0.034, bevel: BEVEL, round: 0.16 });
    for (const piece of model.pieces) {
      expect(piece.outer.length).toBeGreaterThan(0);
      expect(piece.openings.length).toBeLessThanOrEqual(MAX_OPENINGS);
      // Nothing reaches past the rounded corner. Facet corners (where two tangent planes meet) sit just outside the
      // true curve, by at most 1/cos² of half a facet's angle (6 facets per quarter turn).
      const facet = 0.16 / Math.cos(Math.PI / 24) ** 2;
      for (const p of piece.outer.flatMap((poly) => [...poly.points])) {
        const d = p.map((v) => Math.max(0, Math.abs(v) - (1 - 0.16)));
        expect(Math.hypot(...d)).toBeLessThanOrEqual(facet + 1e-6);
      }
    }
  });
});
