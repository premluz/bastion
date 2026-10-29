import { describe, expect, it } from 'vitest';
import { MeshPhysicalMaterial } from 'three';
import { APPEARANCES } from '../../scene/appearance';
import { MATERIAL_FAMILIES } from '../../scene/materialFamilies';
import { DEFAULT_MATERIAL } from '../../settings';
import { applyMaterial } from './applySurface';
import { createCeramicMaterial, createCeramicUniforms } from './opticalCeramic';

describe.each(['dark', 'light'] as const)('%s material controls', (appearance) => {
  it.each(MATERIAL_FAMILIES)('$id reaches opaque matte without suppressing cut emission', ({ id }) => {
    const material = new MeshPhysicalMaterial();
    applyMaterial(material, APPEARANCES[appearance], { ...DEFAULT_MATERIAL, family: id, gloss: 0, translucency: 0 }, true);
    expect(material.roughness).toBe(1);
    expect(material.clearcoat).toBe(0);
    expect(material.specularIntensity).toBe(0);
    expect(material.sheen).toBe(0);
    expect(material.metalness).toBe(0);
    expect(material.transmission).toBe(0);
    expect(material.emissiveIntensity).toBe(1);
    material.dispose();
  });

  it.each(MATERIAL_FAMILIES)('$id allows transmission independently of gloss', ({ id }) => {
    const material = new MeshPhysicalMaterial();
    applyMaterial(material, APPEARANCES[appearance], { ...DEFAULT_MATERIAL, family: id, gloss: 0, translucency: 0.7 }, true);
    expect(material.transmission).toBe(0.7);
    expect(material.roughness).toBe(1);
    applyMaterial(material, APPEARANCES[appearance], { ...DEFAULT_MATERIAL, family: id, translucency: 0.7 }, false);
    expect(material.transmission).toBe(0);
    material.dispose();
  });

  it('switches spectral optics off and preserves the current finish defaults', () => {
    const material = new MeshPhysicalMaterial();
    applyMaterial(material, APPEARANCES[appearance], { ...DEFAULT_MATERIAL, family: 'spectral' }, true);
    expect(material.dispersion).toBeGreaterThan(0);
    expect(material.iridescence).toBeGreaterThan(0);
    applyMaterial(material, APPEARANCES[appearance], { ...DEFAULT_MATERIAL, family: 'spectral', spectral: 0 }, true);
    expect(material.dispersion).toBe(0);
    expect(material.iridescence).toBe(0);
    applyMaterial(material, APPEARANCES[appearance], DEFAULT_MATERIAL, true);
    expect(material.transmission).toBe(APPEARANCES[appearance].surface.transmission);
    expect(material.clearcoat).toBe(APPEARANCES[appearance].surface.clearcoat);
    material.dispose();
  });

  it('keeps the obsidian shell denser than its amber interior', () => {
    const uniforms = createCeramicUniforms([]);
    const skin = createCeramicMaterial('skin', uniforms);
    const wall = createCeramicMaterial('wall', uniforms);
    const params = { ...DEFAULT_MATERIAL, family: 'obsidian' as const };
    applyMaterial(skin, APPEARANCES[appearance], params, true);
    applyMaterial(wall, APPEARANCES[appearance], params, true);
    expect(skin.transmission).toBeLessThan(wall.transmission);
    applyMaterial(wall, APPEARANCES[appearance], { ...params, translucency: 0 }, true);
    expect(wall.transmission).toBe(0);
    skin.dispose();
    wall.dispose();
  });
});
