import { describe, expect, it } from 'vitest';
import { MONOLITH_ORB_STATES, monolithOrbState } from './monolithOrbStates';

describe.each(['dark', 'light'] as const)('%s cube emission', (appearance) => {
  it('keeps resting illumination close to the cuts', () => {
    const state = MONOLITH_ORB_STATES[monolithOrbState('rest', appearance)];
    const material = appearance === 'light' ? MONOLITH_ORB_STATES.restLight.material : MONOLITH_ORB_STATES.rest.material;
    expect(material).toMatchObject({ halo: 0, bodyLight: 0 });
    expect(material.spill).toBeLessThanOrEqual(0.04);
    expect(material.core).toBeGreaterThan(0);
    expect(material.cutLight).toBeGreaterThan(0);
    expect(material.edge).toBe(0.3);
    expect(state.intelligence.flowSpeed).toBe(0);
  });

  it('retains illumination when the assistant works', () => {
    const state = MONOLITH_ORB_STATES[monolithOrbState('working', appearance)];
    const { material } = state;
    expect(material.halo).toBeGreaterThan(0);
    expect(material.halo).toBeLessThanOrEqual(0.08);
    expect(material.core).toBeGreaterThan(0);
    expect(state.intelligence.flowSpeed).toBe(0.18);
    if (appearance === 'light') expect(MONOLITH_ORB_STATES.workingLight.material.edge).toBe(0.6);
    else expect(MONOLITH_ORB_STATES.working.material.edge).toBe(0.6);
  });
});

it('keeps light-mode seam emphasis local to the openings', () => {
  expect(MONOLITH_ORB_STATES.restLight.material).toMatchObject({ cutLight: 1, halo: 0, bodyLight: 0 });
  expect(MONOLITH_ORB_STATES.restLight.material.spill).toBeLessThanOrEqual(0.04);
  expect(MONOLITH_ORB_STATES.landingLight.material.cutLight).toBe(1);
  expect(MONOLITH_ORB_STATES.workingLight.material.cutLight).toBe(1);
});

describe.each(['landing', 'working'] as const)('%s pale cube', (mood) => {
  it('keeps bloom and warm body illumination restrained', () => {
    const { material } = MONOLITH_ORB_STATES[`${mood}Light`];
    expect(material.halo).toBeLessThanOrEqual(0.04);
    expect(material.bodyLight).toBeLessThanOrEqual(0.06);
    expect(material.spill).toBeLessThanOrEqual(0.04);
    expect(material.paleWarmth).toBe(0);
  });

  it('uses shallow low-transmission optics while retaining bright cuts', () => {
    const { material } = MONOLITH_ORB_STATES[`${mood}Light`];
    expect(material).toMatchObject({ translucency: 0.12, opticalThickness: 0.45, diffusion: 0.15, spectral: 0.15 });
    expect(material.cutLight).toBeGreaterThanOrEqual(0.9);
    expect(material.core).toBeGreaterThanOrEqual(0.8);
  });
});
