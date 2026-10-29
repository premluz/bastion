import { describe, expect, it } from 'vitest';
import { APPEARANCES } from '../../scene/appearance';
import { DEFAULT_MATERIAL } from '../../settings';
import { applyMaterial } from './applySurface';
import { createCeramicMaterial, createCeramicUniforms } from './opticalCeramic';
import { REFERENCE_OPTICS, referenceTransmission } from './referenceOptics';
import { familyFinish } from '../../scene/materialFamilies';
import { PALETTE } from '../../brand/palette';
import { OPTICAL_FILM } from './opticalFilm';

it('keeps pearl and spectral neutral beneath illumination-driven interference', () => {
  for (const family of ['opal', 'spectral'] as const) {
    const finish = familyFinish(family, APPEARANCES.light);
    expect(finish.base).toBe(PALETTE.groundLight);
    expect(finish.surface.depthColor).toBe(PALETTE.groundLight);
    expect(finish.surface.transmission).toBeLessThan(0.7);
    expect(REFERENCE_OPTICS[family][0]).toBe(1);
  }
  expect(OPTICAL_FILM).not.toContain('bsNoise');
  expect(OPTICAL_FILM).toContain('evalIridescence');
  expect(OPTICAL_FILM).toContain('bsLocalOptics');
});

describe.each(['dark', 'light'] as const)('%s reference optics', (appearance) => {
  it.each(['ceramic', 'frosted', 'opal'] as const)('%s stays opaque at the alpha layer and has bounded scattering', (family) => {
    const uniforms = createCeramicUniforms([]);
    const material = createCeramicMaterial('skin', uniforms);
    applyMaterial(material, APPEARANCES[appearance], { ...DEFAULT_MATERIAL, family }, true);
    expect(material.opacity).toBe(1);
    expect(material.transparent).toBe(false);
    expect(uniforms.uOpticalProfile.value.toArray()).toEqual(REFERENCE_OPTICS[family]);
    expect(material.clearcoatRoughness).toBeGreaterThan(0.4);
    expect(material.thickness).toBeGreaterThan(1);
    if (family === 'opal') expect(material.iridescenceIOR - material.ior).toBeGreaterThan(0.3);
    applyMaterial(material, APPEARANCES[appearance], { ...DEFAULT_MATERIAL, family }, false);
    expect(material.emissiveIntensity).toBe(0);
    expect(material.transmission).toBe(0);
    material.dispose();
  });
});

it('preserves native rough refraction and attenuation while changing the optical path', () => {
  const shader = referenceTransmission();
  expect(shader).toContain('thickness * mix(1.0, bsOpticalPath(), uOpticalProfile.x)');
  expect(shader).toContain('getIBLVolumeRefraction');
  expect(shader).toContain('material.attenuationColor, material.attenuationDistance');
  expect(REFERENCE_OPTICS.ceramic[1]).toBeLessThan(REFERENCE_OPTICS.opal[1]);
  expect(REFERENCE_OPTICS.opal[1]).toBeLessThan(REFERENCE_OPTICS.frosted[1]);
});
