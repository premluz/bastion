import type { MeshPhysicalMaterial } from 'three';
import type { MaterialParams } from '../../settings';
import { opticalTuningValue } from '../../opticalTuning';
import type { CeramicUniforms } from './opticalCeramic';

/** Family defaults are resolved first; controls adjust optics without replacing the finish. */
export function applyOpticalTuning(material: MeshPhysicalMaterial, uniforms: CeramicUniforms | undefined, params: MaterialParams): void {
  material.thickness *= opticalTuningValue(params, 'opticalThickness');
  material.attenuationDistance *= opticalTuningValue(params, 'attenuationDistance');
  material.dispersion *= opticalTuningValue(params, 'dispersion');
  const filmDepth = opticalTuningValue(params, 'filmDepth');
  material.iridescenceThicknessRange = [
    material.iridescenceThicknessRange[0] * filmDepth,
    material.iridescenceThicknessRange[1] * filmDepth,
  ];
  if (uniforms === undefined) return;
  uniforms.uOpticalProfile.value.y *= opticalTuningValue(params, 'scatterReach');
  uniforms.uOpticalProfile.value.z *= opticalTuningValue(params, 'scatterStrength');
  uniforms.uSeamTuning.value.set(
    opticalTuningValue(params, 'seamSpeed'), opticalTuningValue(params, 'hotspotFocus'),
    opticalTuningValue(params, 'hotspotIntensity'), opticalTuningValue(params, 'beamWidth'),
  );
}
