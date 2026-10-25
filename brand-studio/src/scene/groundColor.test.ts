import { Color } from 'three';
import { describe, expect, it } from 'vitest';
import { PALETTE } from '../brand/palette';
import { neutralToneMap, toneMappedGround } from './groundColor';

describe('tone-mapped ground', () => {
  it.each([PALETTE.groundDark, PALETTE.groundLight])('lands exactly on %s after tone mapping', (hex) => {
    const input = toneMappedGround(hex);
    const out = neutralToneMap([input.r, input.g, input.b]);
    const target = new Color(hex);
    expect(out[0]).toBeCloseTo(target.r, 4);
    expect(out[1]).toBeCloseTo(target.g, 4);
    expect(out[2]).toBeCloseTo(target.b, 4);
  });
});

