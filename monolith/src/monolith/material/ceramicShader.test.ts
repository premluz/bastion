import { describe, expect, it } from 'vitest';
import { FRAGMENT_EMISSION, FRAGMENT_HEADER } from './ceramicShader';
import { createCeramicUniforms } from './opticalCeramic';
import { DEFAULT_SETTINGS } from '../../settings';
import { easeSettings, mergeSettings } from '../../states';

describe('ceramic shader transitions', () => {
  it('uses defined ascending smoothstep edges for both the core field and materialization', () => {
    expect(FRAGMENT_HEADER).toContain('1.0 - smoothstep(uReveal - 0.8, uReveal + 0.8, r)');
    expect(FRAGMENT_EMISSION).toContain('1.0 - smoothstep(uDissolve, uDissolve + 0.05, bsGrain)');
  });
});

it('keeps inner-face emission separate from the travelling cut light and eases its control', () => {
  const uniforms = createCeramicUniforms([]);
  expect(uniforms.uInnerWallGlow.value).toBe(0);
  expect(FRAGMENT_HEADER).toContain('uniform float uInnerWallGlow;');
  expect(FRAGMENT_EMISSION).toContain('uAmber * uInnerWallGlow');
  expect(FRAGMENT_EMISSION.indexOf('uAmber * uInnerWallGlow')).toBeLessThan(FRAGMENT_EMISSION.indexOf('#else'));
  const target = mergeSettings({ material: { innerWallGlow: 1, cutLight: 0 } });
  const eased = easeSettings(DEFAULT_SETTINGS, target, 1 / 60);
  expect(eased.material.innerWallGlow).toBeGreaterThan(0);
  expect(eased.material.innerWallGlow).toBeLessThan(1);
});
