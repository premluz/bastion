import { describe, expect, it } from 'vitest';
import { dissolveIn, dissolveOut, FULLY_DISSOLVED, outPhaseFor } from './dissolveCurve';

describe('dissolve curve', () => {
  it('runs from clear to fully dissolved and back', () => {
    expect(dissolveOut(0)).toBe(0);
    expect(dissolveOut(1)).toBeCloseTo(FULLY_DISSOLVED);
    expect(dissolveIn(0)).toBeCloseTo(FULLY_DISSOLVED);
    expect(dissolveIn(1)).toBeCloseTo(0);
  });

  it('is eased: nearly still at both ends, fastest in the middle', () => {
    const speed = (f: (t: number) => number, t: number): number => Math.abs(f(t + 0.01) - f(t)) / 0.01;
    expect(speed(dissolveOut, 0)).toBeLessThan(0.05);
    expect(speed(dissolveOut, 0.99)).toBeLessThan(0.05);
    expect(speed(dissolveOut, 0.5)).toBeGreaterThan(1.5);
  });

  it('continues from the current level when a switch interrupts the fade-in', () => {
    for (let t = 0; t <= 1; t += 0.05) {
      const level = dissolveIn(t);
      expect(dissolveOut(outPhaseFor(level))).toBeCloseTo(level, 5);
    }
  });
});
