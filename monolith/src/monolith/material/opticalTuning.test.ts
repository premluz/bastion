import { describe, expect, it } from 'vitest';
import { APPEARANCES } from '../../scene/appearance';
import { MATERIAL_FAMILIES } from '../../scene/materialFamilies';
import { DEFAULT_MATERIAL, DEFAULT_SETTINGS } from '../../settings';
import { DEFAULT_OPTICAL_TUNING, OPTICAL_CONTROLS, OPTICAL_TUNING_KEYS, opticalTuningValue } from '../../opticalTuning';
import { easeSettings, mergeSettings } from '../../states';
import { applyMaterial } from './applySurface';
import { createCeramicMaterial, createCeramicUniforms } from './opticalCeramic';
import { REFERENCE_OPTICS } from './referenceOptics';

describe.each(['dark', 'light'] as const)('%s optical tuning', (appearance) => {
  it.each(MATERIAL_FAMILIES)('$id defaults stay calibrated and frame updates do not compound multipliers', ({ id }) => {
    const uniforms = createCeramicUniforms([]);
    const material = createCeramicMaterial('skin', uniforms);
    const params = { ...DEFAULT_MATERIAL, family: id };
    applyMaterial(material, APPEARANCES[appearance], params, true);
    const original = { thickness: material.thickness, distance: material.attenuationDistance,
      dispersion: material.dispersion, film: [...material.iridescenceThicknessRange] };
    expect(uniforms.uOpticalProfile.value.toArray()).toEqual(REFERENCE_OPTICS[id]);
    expect(uniforms.uSeamTuning.value.toArray()).toEqual([1, 1, 1, 1]);
    const tuned = { ...params, opticalThickness: 2, attenuationDistance: 0.5, dispersion: 2,
      filmDepth: 1.5, scatterStrength: 2, scatterReach: 0.5,
      seamSpeed: 0, hotspotFocus: 2, hotspotIntensity: 0, beamWidth: 0.5 };
    for (let frame = 0; frame < 3; frame += 1) {
      applyMaterial(material, APPEARANCES[appearance], tuned, true);
      expect(material.thickness).toBe(original.thickness * 2);
      expect(material.attenuationDistance).toBe(original.distance * 0.5);
      expect(material.dispersion).toBe(original.dispersion * 2);
      expect(material.iridescenceThicknessRange).toEqual(original.film.map((value) => value * 1.5));
      expect(uniforms.uOpticalProfile.value.y).toBe(REFERENCE_OPTICS[id][1] * 0.5);
      expect(uniforms.uOpticalProfile.value.z).toBe(REFERENCE_OPTICS[id][2] * 2);
      expect(uniforms.uSeamTuning.value.toArray()).toEqual([0, 2, 0, 0.5]);
      expect(material.opacity).toBe(1);
    }
    applyMaterial(material, APPEARANCES[appearance], { ...tuned, ...DEFAULT_OPTICAL_TUNING }, true);
    expect(material.thickness).toBe(original.thickness);
    expect(uniforms.uOpticalProfile.value.toArray()).toEqual(REFERENCE_OPTICS[id]);
    material.dispose();
  });
});

it('bounds every control, rejects non-finite input and eases host state changes', () => {
  for (const key of OPTICAL_TUNING_KEYS) {
    const control = OPTICAL_CONTROLS[key];
    expect(opticalTuningValue({}, key)).toBe(1);
    expect(opticalTuningValue({ [key]: -100 }, key)).toBe(control.min);
    expect(opticalTuningValue({ [key]: 100 }, key)).toBe(control.max);
    expect(() => opticalTuningValue({ [key]: Number.NaN }, key)).toThrow('Non-finite optical control');
    const target = mergeSettings({ material: { [key]: control.max } });
    const next = easeSettings(DEFAULT_SETTINGS, target, 1 / 60);
    expect(next.material[key]).toBeGreaterThan(1);
    expect(next.material[key]).toBeLessThan(control.max);
  }
});
