import { describe, expect, it } from 'vitest';
import { SEAM_LIGHT } from './seamLight';
import { buildMonolith } from '../geometry/buildMonolith';
import { VARIANTS } from '../variants';
import { IntelligenceDriver } from '../intelligence/driver';
import type { Vec3 } from '../geometry/vec';
import { pieceMotions, pieceTransform } from '../assembly/pieceMotion';

const PARAMS = { activity: 0.8, flowSpeed: 0.6, impulse: 0, mode: 'thinking', style: 'currents' } as const;
const SAMPLE_COUNT = 40;

it('confines detached beams to edges with negligible radiance deeper into the wall', () => {
  for (const open of [0, 0.5, 1]) {
    const width = SEAM_LIGHT.wallWidth + open * (SEAM_LIGHT.openWidth - SEAM_LIGHT.wallWidth);
    const beam = (distance: number) => Math.exp(-Math.pow(distance / width, 2));
    expect(beam(0)).toBe(1);
    expect(beam(width)).toBeCloseTo(Math.exp(-1));
    expect(beam(0.25)).toBeLessThan(0.000001);
  }
});

function concentration(p: Vec3, drift: number): number {
  const c = (p[0] * SEAM_LIGHT.direction[0] + p[1] * SEAM_LIGHT.direction[1] + p[2] * SEAM_LIGHT.direction[2]) * SEAM_LIGHT.frequency;
  const primary = Math.exp(-SEAM_LIGHT.sharpness * (1 - Math.cos(c - drift * SEAM_LIGHT.speed)));
  const secondary = Math.exp(-SEAM_LIGHT.sharpness * (1 - Math.cos(c * SEAM_LIGHT.secondaryFrequency + drift * SEAM_LIGHT.secondarySpeed + SEAM_LIGHT.secondaryOffset)));
  return primary + SEAM_LIGHT.secondaryGain * secondary;
}

describe.each(VARIANTS)('$id crack illumination', (variant) => {
  const model = buildMonolith(variant, { cutWidth: 0.034, bevel: 0 });
  it('exposes the inner walls at the validation capture progress', () => {
    const openness = pieceMotions(model).map((motion) => pieceTransform(motion, 0.32).openness);
    expect(Math.min(...openness)).toBeGreaterThan(0.8);
  });
  const samples = model.pieces.flatMap((piece) => piece.openings.flatMap(([a, b]) =>
    Array.from({ length: SAMPLE_COUNT }, (_, i): Vec3 => {
      const t = i / (SAMPLE_COUNT - 1);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    })));

  it('has bright and quiet stretches on actual openings, not an even emissive outline', () => {
    const values = samples.map((p) => concentration(p, 0));
    expect(Math.max(...values)).toBeGreaterThan(0.9);
    expect(Math.min(...values)).toBeLessThan(0.1);
    expect(samples.every((p) => Number.isFinite(concentration(p, 10)))).toBe(true);
  });

  it('moves continuously and freezes with the existing pause control', () => {
    const driver = new IntelligenceDriver(PARAMS, 0);
    const initial = driver.field(model.junctions, PARAMS).drift;
    for (let frame = 0; frame < 120; frame++) driver.step(1 / 60, PARAMS, 0, false);
    const moving = driver.field(model.junctions, PARAMS).drift;
    expect(samples.some((p) => Math.abs(concentration(p, initial) - concentration(p, moving)) > 0.5)).toBe(true);
    for (let frame = 0; frame < 120; frame++) driver.step(1 / 60, PARAMS, 0, true);
    expect(driver.field(model.junctions, PARAMS).drift).toBe(moving);
    expect(Math.max(...samples.map((p) => Math.abs(concentration(p, moving) - concentration(p, moving + 0.001))))).toBeLessThan(0.01);
  });
});
