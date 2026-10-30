import { describe, expect, it } from 'vitest';
import { WEB_LIGHT_DEFAULT, MONOLITH_ORB_STATES } from './appCubeStates';
import { DEFAULT_SETTINGS } from './settings';

describe('web-light cube default', () => {
  it('matches the selected Studio surface, optical and light controls', () => {
    expect(WEB_LIGHT_DEFAULT.material).toEqual({
      ...DEFAULT_SETTINGS.material,
      gloss: 0.09, translucency: 1, spectral: 0.25, paleWarmth: 1,
      cornerRadius: 0.21, cutWidth: 0.07, roughness: 1, reflectance: 0.75, edge: 0.91,
      grainScale: 1400, grainAmount: 0.5,
      opticalThickness: 0.85, attenuationDistance: 2.05, filmDepth: 2, dispersion: 3,
      seamSpeed: 1.2, hotspotFocus: 0.8, hotspotIntensity: 0.8, beamWidth: 2,
      halo: 0, core: 0.67, cutLight: 0.14, innerWallGlow: 0.72, spill: 0.21, bodyLight: 0.23,
      diffusion: 0.15, absorption: 0, falloff: 0.8,
    });
  });

  it('matches the selected intelligence controls and the app resting state', () => {
    expect(WEB_LIGHT_DEFAULT.intelligence).toEqual({
      ...DEFAULT_SETTINGS.intelligence,
      mode: 'thinking', style: 'currents', activity: 0.25, flowSpeed: 0.1, impulse: 0.4,
    });
    expect(MONOLITH_ORB_STATES.restLight).toEqual(WEB_LIGHT_DEFAULT);
  });
});
